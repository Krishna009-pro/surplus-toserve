import { Plus, ListChecks, Search, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "@/hooks/useDashboardData";

interface ActionConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  variant: "primary" | "secondary";
}

const donorActions: ActionConfig[] = [
  {
    label: "Post New Donation",
    description: "Share surplus food with those in need",
    icon: <Plus className="w-5 h-5" />,
    path: "/donate",
    variant: "primary",
  },
  {
    label: "View My Listings",
    description: "Manage your active donations",
    icon: <ListChecks className="w-5 h-5" />,
    path: "/listings",
    variant: "secondary",
  },
];

const ngoActions: ActionConfig[] = [
  {
    label: "Browse Marketplace",
    description: "Find available food donations nearby",
    icon: <Search className="w-5 h-5" />,
    path: "/marketplace",
    variant: "primary",
  },
  {
    label: "View Claimed Items",
    description: "Track your claimed donations",
    icon: <ClipboardList className="w-5 h-5" />,
    path: "/claimed",
    variant: "secondary",
  },
];

export function QuickActions({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const actions = role === "donor" ? donorActions : ngoActions;

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-up animate-delay-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group ${
              action.variant === "primary"
                ? "bg-primary text-primary-foreground border-primary hover:opacity-90 hover:shadow-lg"
                : "bg-card text-card-foreground border-border hover:border-primary/30 hover:shadow-md"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                action.variant === "primary"
                  ? "bg-primary-foreground/15"
                  : "bg-muted group-hover:bg-primary/10"
              }`}
            >
              {action.icon}
            </div>
            <div>
              <div className="font-semibold text-sm">{action.label}</div>
              <div
                className={`text-xs mt-0.5 ${
                  action.variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {action.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
