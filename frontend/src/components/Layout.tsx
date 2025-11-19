import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users,  
  Upload, 
  LogOut,
  Activity,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ View Reports added here
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: Upload, label: "Upload Reports", path: "/upload" },
    { icon: FileText, label: "View Reports", path: "/reports" }, // ★ NEW
  ];

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md shadow-md">
        <div className="container flex h-16 items-center justify-between px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full blur-lg opacity-50"></div>
              <Activity className="h-7 w-7 text-primary relative z-10" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureCare
            </h1>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex">

        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card/50 backdrop-blur-sm p-4">
          <nav className="space-y-2">

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-smooth",
                    !isActive && "hover:bg-muted hover:translate-x-1",
                    isActive && "shadow-md"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}

          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
