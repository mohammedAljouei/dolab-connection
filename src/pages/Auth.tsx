import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isDisplayNamePromptVisible, setIsDisplayNamePromptVisible] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateEmailFromPhone = (phone: string) => {
    return `${phone}@gmail.com`; // Use a predefined domain
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = generateEmailFromPhone(phone);
      const predefinedPassword = "123456"; // Use a predefined password

      // Try to sign in the user
      let { error, data: signInData } = await supabase.auth.signInWithPassword({
        email: email,
        password: predefinedPassword,
      });

      // If the user does not exist, sign them up
      if (error) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: predefinedPassword,
        });

        if (signUpError) throw signUpError;

        // Show the display name prompt
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
      <Card className="w-full max-w-md p-6 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-center mb-6">
          دخول
        </h2>
        
        {!isDisplayNamePromptVisible ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="05xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-left ltr"
                dir="ltr"
              />
            </div>

            <Button 
              className="w-full btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري التحميل..." : "دخول"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleDisplayNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">اسم العرض الخاص بك</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="سيظهر هذا الاسم للمستخدمين الآخرين"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <Button 
              className="w-full btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري التحميل..." : "حفظ"}
            </Button>
          </form>
        )}
        <p className="text-center mt-4 text-sm text-gray-600">
          اهلا بـك في مجتمع دولاب
        </p>
      </Card>
    </div>
  );
};

export default Auth;