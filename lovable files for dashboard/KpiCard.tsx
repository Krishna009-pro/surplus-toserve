import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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
    bg: "bg-emerald-light",
    iconBg: "bg-emerald-light text-emerald",
  },
  blue: {
    stroke: "hsl(220, 65%, 48%)",
    fill: "hsl(220, 65%, 48%)",
    bg: "bg-deep-blue-light",
    iconBg: "bg-deep-blue-light text-deep-blue",
  },
  warning: {
    stroke: "hsl(38, 92%, 50%)",
    fill: "hsl(38, 92%, 50%)",
    bg: "bg-warning-light",
    iconBg: "bg-warning-light text-warning",
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
  const delayClass = delay === 0 ? "" : delay === 1 ? "animate-delay-1" : delay === 2 ? "animate-delay-2" : "animate-delay-3";

  const chartData = (sparklineData ?? [5, 8, 4, 9, 6, 12, 8]).map((v, i) => ({ v, i }));

  return (
    <div className={`glass-card rounded-xl p-5 relative overflow-hidden animate-fade-up ${delayClass}`}>
      {/* Sparkline background */}
      <div className="absolute bottom-0 right-0 w-2/3 h-16 opacity-10">
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
              <TrendingUp className="w-3.5 h-3.5 text-emerald" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald" : "text-destructive"}`}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
