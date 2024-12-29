import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  timestamp: string;
}

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: "1",
        content: "مرحباً بكم في دولاب! نحن متحمسون لمشاركة قصصكم وتجاربكم",
        author: {
          name: "سارة",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
        },
        likes: 42,
        timestamp: "منذ ساعتين",
      },
      {
        id: "2",
        content: "أحب كيف يمكننا مشاركة أفكارنا وتجاربنا هنا بكل حرية",
        author: {
          name: "نور",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
        },
        likes: 24,
        timestamp: "منذ 3 ساعات",
      },
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = () => {
    toast({
      title: "تسجيل الدخول مطلوب",
      description: "يرجى تسجيل الدخول للتفاعل مع المنشورات",
    });
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
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-6 feed-item">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <p className="mt-4 text-lg">{post.content}</p>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-primary"
              onClick={handleLike}
            >
              <Heart className="ml-2 h-4 w-4" />
              {post.likes}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};