import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-xl space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Healthcare Management System
        </h1>

        <p className="text-lg text-muted-foreground">
          Secure, modern and efficient platform for managing patients,
          appointments and medical records.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" className="px-8" onClick={() => navigate("/login")}>
            Login
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="px-8"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
