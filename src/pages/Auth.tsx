import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Phone, User } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isDisplayNamePromptVisible, setIsDisplayNamePromptVisible] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateEmailFromPhone = (phone: string) => {
    return `${phone}@gmail.com`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = generateEmailFromPhone(phone);
      const predefinedPassword = "123456";

      let { error, data: signInData } = await supabase.auth.signInWithPassword({
        email: email,
        password: predefinedPassword,
      });

      if (error) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: predefinedPassword,
        });

        if (signUpError) throw signUpError;
        setIsDisplayNamePromptVisible(true);
        return;
      }

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

  const handleDisplayNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) throw error;

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
        <Card className="p-8 shadow-lg">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <img 
              src="https://doulab.qride.net/logodoulab.png" 
              alt="دولاب" 
              className="w-16 h-16 object-contain"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-6"
          >
            {isDisplayNamePromptVisible ? "وش حابه نناديك؟" : "مرحباً بك في دولاب"}
          </motion.h2>
          
          {!isDisplayNamePromptVisible ? (
            <motion.form 
              onSubmit={handleAuth} 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="text-left pl-3 pr-10"
                    dir="ltr"
                  />
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
                  {loading ? "جاري التحميل..." : "دخول"}
                </Button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form 
              onSubmit={handleDisplayNameSubmit} 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="displayName">اسم العرض</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="كيف تحبين أن نناديكِ؟"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="pr-10"
                  />
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
                  {loading ? "جاري التحميل..." : "حفظ"}
                </Button>
              </motion.div>
            </motion.form>
          )}

          <motion.p 
            className="text-center mt-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            مجتمع نسائي آمن للمشاركة والتفاعل
          </motion.p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;