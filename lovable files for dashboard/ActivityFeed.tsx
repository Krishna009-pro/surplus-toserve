import { Clock, Package, HandHeart, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

const iconMap: Record<string, React.ReactNode> = {
  donation_posted: <Package className="w-4 h-4 text-emerald" />,
  donation_claimed: <HandHeart className="w-4 h-4 text-deep-blue" />,
  donation_expiring: <AlertTriangle className="w-4 h-4 text-warning" />,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-up animate-delay-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Recent Activity</h3>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Activity will appear here as you use the platform</p>
        </div>
      ) : (
        <ScrollArea className="h-64">
          <div className="space-y-3 pr-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {iconMap[item.event_type] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground leading-snug">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
