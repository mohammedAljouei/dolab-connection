import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual auth
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button className="w-full btn-primary" type="submit">
            {isLogin ? "دخول" : "إنشاء حساب"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          <button
            className="text-primary hover:underline mr-1"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "سجل الآن" : "تسجيل الدخول"}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;