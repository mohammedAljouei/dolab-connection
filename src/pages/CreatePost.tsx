import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Image, Smile } from "lucide-react";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-lg">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-6"
          >
            إنشاء منشور جديد
          </motion.h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">شاركي أفكارك</Label>
              <div className="relative">
                <Textarea
                  id="content"
                  placeholder="وش ببالك اليوم؟"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="min-h-[150px] text-lg p-4 resize-none bg-card"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {/* <Button type="button" size="icon" variant="ghost">
                    <Image className="w-5 h-5" />
                  </Button> */}
                  <Button type="button" size="icon" variant="ghost">
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "جاري النشر..." : "نشر"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatePost;