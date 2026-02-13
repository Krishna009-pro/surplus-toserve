import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ImpactChartProps {
  title: string;
  data: { date: string; value: number }[];
  color?: "emerald" | "blue";
  valueLabel?: string;
}

const colors = {
  emerald: { stroke: "hsl(152, 60%, 36%)", fill: "hsl(152, 50%, 94%)", gradient: "url(#emeraldGradient)" },
  blue: { stroke: "hsl(220, 65%, 48%)", fill: "hsl(220, 50%, 94%)", gradient: "url(#blueGradient)" },
};

type TimeRange = "7d" | "30d" | "all";

export function ImpactChart({ title, data, color = "emerald", valueLabel = "Value" }: ImpactChartProps) {
  const [range, setRange] = useState<TimeRange>("30d");
  const c = colors[color];

  const filteredData =
    range === "7d" ? data.slice(-7) : range === "30d" ? data.slice(-30) : data;

  const gradientId = color === "emerald" ? "emeraldGradient" : "blueGradient";
  const strokeColor = c.stroke;

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-up animate-delay-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(["7d", "30d", "all"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(215, 14%, 46%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(215, 14%, 46%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 20%, 92%)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={valueLabel}
              stroke={strokeColor}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
