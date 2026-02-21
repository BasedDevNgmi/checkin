"use client";

import { useMemo } from "react";

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

export function EnergyChart({
  data,
  title = "Energie trend",
  subtitle = "Gemiddelde energie per dag",
}: EnergyChartProps) {
  const max = useMemo(() => Math.max(100, ...data.map((d) => d.value ?? 0)), [data]);
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
      <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-soft)]">{subtitle}</p>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((point) => (
          <div
            key={point.date}
            className="flex-1 flex flex-col items-center gap-2 min-w-0"
          >
            <div
              className="w-full max-w-[40px] rounded-t-[var(--radius-control)] bg-[var(--accent)] transition-all duration-500"
              style={{
                height: point.value != null ? `${(point.value / max) * 100}%` : "4px",
                minHeight: point.value != null ? "8px" : "4px",
                opacity: point.value != null ? 0.6 + (point.value / max) * 0.4 : 0.2,
              }}
              title={`${point.label}: ${point.value ?? "—"}%`}
            />
            <span className="w-full truncate text-center text-xs text-[var(--text-soft)]">
              {point.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-[var(--text-soft)]">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
