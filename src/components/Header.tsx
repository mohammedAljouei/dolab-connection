import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = false; // TODO: Replace with actual auth state

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">دولاب</h1>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button 
              variant="ghost"
              className="btn-primary"
              onClick={() => navigate("/new-post")}
            >
              نشر
            </Button>
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