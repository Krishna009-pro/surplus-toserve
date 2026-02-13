import { Clock, Package, HandHeart, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import React from "react";

interface ActivityItem {
    id: string;
    event_type: string;
    description: string;
    created_at: string;
}

const iconMap: Record<string, React.ReactNode> = {
    donation_posted: <Package className="w-4 h-4 text-emerald-600" />,
    donation_claimed: <HandHeart className="w-4 h-4 text-blue-600" />,
    donation_expiring: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
    return (
        <Card className="col-span-1 h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs mt-1">Activity will appear here as you use the platform</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                >
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                        {iconMap[item.event_type] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-card-foreground leading-snug">{item.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
