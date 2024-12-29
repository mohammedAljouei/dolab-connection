import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">دولاب</h1>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost"
                className="btn-primary"
                onClick={() => navigate("/new-post")}
              >
                نشر
              </Button>
              <Button 
                variant="ghost"
                onClick={handleLogout}
              >
                خروج
              </Button>
            </>
          ) : (
            <Button 
              className="btn-primary"
              onClick={() => navigate("/auth")}
            >
              اشترك
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};