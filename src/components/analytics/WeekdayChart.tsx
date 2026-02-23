"use client";

import { useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface WeekdayDatum {
  day: string;
  avg: number;
  count: number;
}

interface WeekdayChartProps {
  data: WeekdayDatum[];
}

const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function barColor(avg: number): string {
  if (avg >= 70) return "var(--text-success)";
  if (avg >= 40) return "var(--accent)";
  return "var(--text-error)";
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: WeekdayDatum }[]; label?: string }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-[var(--radius-small)] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2 shadow-[var(--shadow-zen)] text-[13px]">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="text-[var(--text-muted)]">Gem. {Math.round(d.avg)}% ({d.count}x)</p>
    </div>
  );
}

export function WeekdayChart({ data }: WeekdayChartProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Energie per dag</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Gemiddelde per weekdag</p>
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--text-soft)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--text-soft)" }}
              tickLine={false}
              axisLine={false}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="avg"
              radius={[4, 4, 0, 0]}
              isAnimationActive={!reduceMotion}
              animationDuration={600}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.avg)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { DAY_LABELS, type WeekdayDatum };
