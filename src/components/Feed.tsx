import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

// Array of girl avatar URLs
const GIRL_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=girl1&style=circle&backgroundColor=ffdfbf&hair=long&top=longHair",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=girl2&style=circle&backgroundColor=ffd5dc&hair=longStraight&top=longHair",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=girl3&style=circle&backgroundColor=ffccd5&hair=longCurly&top=longHair",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=girl4&style=circle&backgroundColor=ffc0cb&hair=longBob&top=longHair",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=girl5&style=circle&backgroundColor=ffb6c1&hair=longWaved&top=longHair"
];

interface Post {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  display_name?: string;
}

interface Reply {
  id: number;
  content: string;
  user_id: string;
  post_id: number;
  parent_reply_id?: number;
  created_at: string;
  display_name?: string;
}

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<{ postId: number; replyId?: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, content, user_id, created_at")
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
            const { data: profileData } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", post.user_id)
              .single();

            return {
              ...post,
              display_name: profileData?.display_name || "مستخدم دولاب",
            };
          })
        );
        setPosts(postsWithDisplayName || []);
      }

      setLoading(false);
    };

    fetchPosts();
    fetchReplies();
  }, [toast]);

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
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", reply.user_id)
            .single();

          return {
            ...reply,
            display_name: profileData?.display_name || "مستخدم دولاب",
          };
        })
      );
      setReplies(repliesWithDisplayName || []);
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
      await fetchReplies();
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

  const getRandomGirlAvatar = (userId: string) => {
    const index = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % GIRL_AVATARS.length;
    return GIRL_AVATARS[index];
  };

  const renderReplies = (postId: number) => {
    return replies
      .filter((reply) => reply.post_id === postId)
      .map((reply, index) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getRandomGirlAvatar(reply.user_id)} />
              <AvatarFallback>{reply.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="bg-secondary rounded-lg p-3 shadow-sm">
                <p className="text-sm font-medium text-primary">{reply.display_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(reply.created_at).toLocaleString()}</p>
                <p className="mt-2 text-sm">{reply.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setReplyingTo({ postId, replyId: reply.id })}
              >
                رد
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {replyingTo?.replyId === reply.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mr-12"
              >
                <div className="flex gap-2">
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleReply(postId, replyContent, reply.id)}
                    size="sm"
                  >
                    إرسال
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="post-card"
          >
            <Card className="p-6 shadow-md">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getRandomGirlAvatar(post.user_id)} />
                  <AvatarFallback>{post.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-lg text-primary">{post.display_name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                  <p className="mt-4 text-lg leading-relaxed">{post.content}</p>
                  
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary flex gap-2"
                      onClick={() => setReplyingTo({ postId: post.id })}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>رد</span>
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {replyingTo?.postId === post.id && !replyingTo.replyId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="flex gap-2">
                      <Input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleReply(post.id, replyContent)}
                      >
                        إرسال
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 space-y-4">
                {renderReplies(post.id)}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};