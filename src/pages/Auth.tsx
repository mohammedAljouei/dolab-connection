import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    // Ensure phone number starts with +966
    if (!phone.startsWith("+966")) {
      return "+966" + phone.replace(/^0+/, "");
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      // For now, we'll use a dummy password since Supabase requires one
      const dummyPassword = "temporary_password_" + Math.random().toString(36);
      
      if (isLogin) {
        // For login, we'll use signInWithPassword but in the future this will be replaced with OTP
        const { error } = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password: dummyPassword,
        });

        if (error) throw error;
        navigate("/");
      } else {
        // For signup, we'll use signUp but in the future this will be replaced with OTP
        const { error } = await supabase.auth.signUp({
          phone: formattedPhone,
          password: dummyPassword,
        });

        if (error) throw error;
        toast({
          title: "تم إنشاء حسابك بنجاح",
          description: "يمكنك الآن تسجيل الدخول",
        });
        setIsLogin(true);
      }
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
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "جاري التحميل..." : (isLogin ? "دخول" : "إنشاء حساب")}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          <button
            className="text-primary hover:underline mr-1"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? "سجل الآن" : "تسجيل الدخول"}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;