import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { patients } = useData();
  const navigate = useNavigate();

  const safePatients = patients ?? [];

  const quickActions = [
    {
      icon: Users,
      title: "Add Patient",
      description: "Register a new patient",
      action: () => navigate("/patients"),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: "View Patients",
      description: "Browse patient records",
      action: () => navigate("/patients"),
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Upload,
      title: "Upload Report",
      description: "Add medical documents",
      action: () => navigate("/upload"),
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <Layout>
      <div className="space-y-10">

        {/* Welcome Section */}
        <div className="relative">
          <div className="absolute inset-0 gradient-primary rounded-2xl blur-3xl opacity-20"></div>

          <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary/10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome {user?.role === "admin" ? "Admin" : "Doctor"}
            </h1>

            <p className="text-muted-foreground text-lg mt-2">
              Here's an overview of your healthcare management system
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Total Patients"
            value={safePatients.length}
            icon={Users}
            color="text-primary"
            bg="bg-primary/10"
            description="Active patients in system"
          />

          <DashboardStatCard
            title="Reports"
            value={safePatients.reduce(
              (acc, p) => acc + (p?.reports?.length ?? 0),
              0
            )}
            icon={FileText}
            color="text-accent"
            bg="bg-accent/10"
            description="Medical reports uploaded"
          />

          <DashboardStatCard
            title="Your Role"
            value={user?.role}
            icon={Upload}
            color="text-success"
            bg="bg-success/10"
            description="Access level"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span className="h-1 w-12 gradient-primary rounded-full"></span>
            Quick Access
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg hover:scale-[1.03] transition-all border-primary/10 bg-gradient-to-br from-card to-card/50"
                  onClick={action.action}
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className={`inline-flex p-4 rounded-xl ${action.color}`}>
                      <Icon className="h-7 w-7" />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {safePatients.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">Age: {p.age}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}

function DashboardStatCard({ title, value, icon: Icon, color, bg, description }: any) {
  return (
    <Card className="hover:shadow-lg transition border-primary/20 hover:scale-[1.03]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          {value}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
