import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import React from "react";

interface KpiCardProps {
    title: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    sparklineData?: number[];
    color?: "emerald" | "blue" | "warning";
    icon: React.ReactNode;
    delay?: number;
}

const colorMap = {
    emerald: {
        stroke: "hsl(152, 60%, 36%)",
        fill: "hsl(152, 60%, 36%)",
        bg: "bg-emerald-50",
        iconBg: "bg-emerald-50 text-emerald-600",
    },
    blue: {
        stroke: "hsl(220, 65%, 48%)",
        fill: "hsl(220, 65%, 48%)",
        bg: "bg-blue-50",
        iconBg: "bg-blue-50 text-blue-600",
    },
    warning: {
        stroke: "hsl(38, 92%, 50%)",
        fill: "hsl(38, 92%, 50%)",
        bg: "bg-amber-50",
        iconBg: "bg-amber-50 text-amber-600",
    },
};

export function KpiCard({
    title,
    value,
    trend,
    trendLabel = "vs last month",
    sparklineData,
    color = "emerald",
    icon,
    delay = 0,
}: KpiCardProps) {
    const colors = colorMap[color];
    const delayClass = delay === 0 ? "" : delay === 1 ? "animate-delay-100" : delay === 2 ? "animate-delay-200" : "animate-delay-300";

    const chartData = (sparklineData ?? [5, 8, 4, 9, 6, 12, 8]).map((v, i) => ({ v, i }));

    return (
        <div className={`bg-white/70 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl p-5 relative overflow-hidden animate-fade-in ${delayClass}`}>
            {/* Sparkline background */}
            <div className="absolute bottom-0 right-0 w-2/3 h-16 opacity-10 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={colors.stroke}
                            fill={colors.fill}
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
                        {icon}
                    </div>
                </div>

                <div className="text-3xl font-bold tracking-tight text-card-foreground">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>

                {trend !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {trend >= 0 ? "+" : ""}{trend}%
                        </span>
                        <span className="text-xs text-muted-foreground">{trendLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
