import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Post {
  id: number;
  content: string;
  user_id: string; // Change to string to match auth.users.id
  likes: number;
  created_at: string;
  display_name?: string; // Add display_name to Post interface
}

interface Reply {
  id: number;
  content: string;
  user_id: string; // Change to string to match auth.users.id
  post_id: number;
  parent_reply_id?: number;
  created_at: string;
  display_name?: string; // Add display_name to Reply interface
}

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<{ postId: number; replyId?: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, content, user_id, likes, created_at")
        .order("created_at", { ascending: false });

      if (postsError) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: postsError.message,
        });
      } else {
        const postsWithDisplayName = await Promise.all(
          postsData.map(async (post: Post) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", post.user_id)
              .single();

            if (profileError) {
              // toast({
              //   variant: "destructive",
              //   title: "خطأ",
              //   description: profileError.message,
              // });
              return post;
            }

            return {
              ...post,
              display_name: profileData.display_name,
            };
          })
        );
        setPosts(postsWithDisplayName || []);
      }

      setLoading(false);
    };

    const fetchReplies = async () => {
      const { data: repliesData, error: repliesError } = await supabase
        .from("replies")
        .select("*")
        .order("created_at", { ascending: true });

      if (repliesError) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: repliesError.message,
        });
      } else {
        const repliesWithDisplayName = await Promise.all(
          repliesData.map(async (reply: Reply) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", reply.user_id)
              .single();

            if (profileError) {
              // toast({
              //   variant: "destructive",
              //   title: "خطأ",
              //   description: profileError.message,
              // });
              return reply;
            }

            return {
              ...reply,
              display_name: profileData.display_name,
            };
          })
        );
        setReplies(repliesWithDisplayName || []);
      }
    };

    const fetchLikedPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id);

        if (likesError) {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: likesError.message,
          });
        } else {
          setLikedPosts(likesData.map((like: { post_id: number }) => like.post_id));
        }
      }
    };

    fetchPosts();
    fetchReplies();
    fetchLikedPosts();
  }, [toast]);

  const handleLike = async (postId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يرجى تسجيل الدخول للتفاعل مع المنشورات",
        });
        return;
      }

      if (likedPosts.includes(postId)) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) throw error;

        toast({ title: "تم إلغاء الإعجاب" });

        setLikedPosts((prevLikedPosts) => prevLikedPosts.filter((id) => id !== postId));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );
      } else {
        const { error } = await supabase
          .from("likes")
          .insert([{ user_id: user.id, post_id: postId }]);

        if (error) throw error;

        toast({ title: "تم تسجيل الإعجاب" });

        setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    }
  };

  const handleReply = async (postId: number, content: string, parentReplyId?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يرجى تسجيل الدخول للتفاعل مع المنشورات",
        });
        return;
      }

      const { error } = await supabase
        .from("replies")
        .insert([{ user_id: user.id, post_id: postId, content, parent_reply_id: parentReplyId }]);

      if (error) throw error;

      toast({ title: "تم إضافة الرد" });

      const { data: repliesData, error: repliesError } = await supabase
        .from("replies")
        .select("*")
        .order("created_at", { ascending: true });

      if (repliesError) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: repliesError.message,
        });
      } else {
        const repliesWithDisplayName = await Promise.all(
          repliesData.map(async (reply: Reply) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", reply.user_id)
              .single();

            if (profileError) {
              toast({
                variant: "destructive",
                title: "خطأ",
                description: profileError.message,
              });
              return reply;
            }

            return {
              ...reply,
              display_name: profileData.display_name,
            };
          })
        );
        setReplies(repliesWithDisplayName || []);
      }

      setReplyContent("");
      setReplyingTo(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    }
  };

  const renderReplies = (postId: number) => {
    return replies
      .filter((reply) => reply.post_id === postId)
      .map((reply) => (
        <motion.div
          key={reply.id}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user_id}`} />
              <AvatarFallback>{reply.user_id[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 p-3 rounded-lg shadow-md">
              <p className="text-sm text-gray-500">{reply.display_name || reply.user_id}</p>
              <p className="text-sm text-gray-500">{new Date(reply.created_at).toLocaleString()}</p>
              <p className="mt-1">{reply.content}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-primary"
                onClick={() => setReplyingTo({ postId, replyId: reply.id })}
              >
                رد
              </Button>
            </div>
          </div>
          {replyingTo?.replyId === reply.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="ml-12 mt-2"
            >
              <Input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="اكتب ردك هنا..."
              />
              <Button
                onClick={() => handleReply(postId, replyContent, reply.id)}
                className="mt-2"
              >
                إرسال
              </Button>
            </motion.div>
          )}
        </motion.div>
      ));
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 shadow-lg rounded-lg transition-transform hover:scale-105">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
                <AvatarFallback>{post.user_id[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">{post.display_name || post.user_id}</p>
                <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-lg font-medium">{post.content}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-500 hover:text-red-500 ${
                  likedPosts.includes(post.id) ? 'text-red-500' : ''
                }`}
                onClick={() => handleLike(post.id)}
              >
                <Heart className="ml-2 h-4 w-4" />
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-primary"
                onClick={() => setReplyingTo({ postId: post.id })}
              >
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {replyingTo?.postId === post.id && !replyingTo.replyId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                />
                <Button
                  onClick={() => handleReply(post.id, replyContent)}
                  className="mt-2"
                >
                  إرسال
                </Button>
              </motion.div>
            )}
            <div className="mt-4 space-y-2">{renderReplies(post.id)}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
