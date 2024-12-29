import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message,
        });
      } else {
        setUserId(data?.user?.id || null);
      }
    };

    fetchUser();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('posts')
        .insert([{ content, user_id: userId }]);

      if (error) throw error;

      toast({
        title: "تم إنشاء المنشور بنجاح",
        description: "تم إضافة المنشور الخاص بك",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-center mb-6">
          إنشاء منشور
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">محتوى المنشور</Label>
            <Textarea
              id="content"
              placeholder="أدخل محتوى المنشور"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <Button 
            className="w-full btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? "جاري التحميل..." : "إنشاء منشور"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreatePost;
