"use client";

import { useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface DayPoint {
  date: string;
  label: string;
  value: number | null;
}

interface EnergyChartProps {
  data: DayPoint[];
  title?: string;
  subtitle?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number | null }[]; label?: string }) {
  if (!active || !payload?.[0]) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-[var(--radius-small)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-zen)] text-[13px]">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="text-[var(--text-muted)]">{val != null ? `${val}%` : "Geen data"}</p>
    </div>
  );
}

export function EnergyChart({
  data,
  title = "Energie trend",
  subtitle = "Gemiddelde energie per dag",
}: EnergyChartProps) {
  const reduceMotion = useReducedMotion();
  const filtered = data.map((d) => ({ ...d, value: d.value ?? undefined }));

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-soft)]">{subtitle}</p>
      <div className="mt-4 h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--text-soft)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--text-soft)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={50} stroke="var(--surface-border)" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#energyGrad)"
              connectNulls={false}
              dot={{ r: 2, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 2, stroke: "var(--surface)" }}
              isAnimationActive={!reduceMotion}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
