"use client";

import { useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface BehaviorDatum {
  name: string;
  value: number;
}

interface BehaviorRingProps {
  data: BehaviorDatum[];
}

const COLORS = [
  "var(--accent)",
  "var(--text-success)",
  "#d9a038",
  "var(--text-error)",
  "var(--text-soft)",
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-[var(--radius-small)] border border-[var(--surface-border)] bg-[var(--surface-elevated)] px-3 py-2 shadow-[var(--shadow-zen)] text-[13px]">
      <p className="font-medium text-[var(--text-primary)]">{payload[0].name}</p>
      <p className="text-[var(--text-muted)]">{payload[0].value}x</p>
    </div>
  );
}

export function BehaviorRing({ data }: BehaviorRingProps) {
  const reduceMotion = useReducedMotion();

  if (data.length === 0) return null;

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Gedrag</h3>
      <p className="mt-1 text-xs text-[var(--text-soft)]">Bewust vs. automatisch</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="90%"
                paddingAngle={3}
                strokeWidth={0}
                isAnimationActive={!reduceMotion}
                animationDuration={600}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-[13px]">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-[var(--text-primary)]">{d.name}</span>
              <span className="text-[var(--text-soft)] tabular-nums">{d.value}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { BehaviorDatum };
