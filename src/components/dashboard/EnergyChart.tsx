"use client";

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
  const max = Math.max(100, ...data.map((d) => d.value ?? 0));
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-zen)] backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-soft)]">{subtitle}</p>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((point) => (
          <div
            key={point.date}
            className="flex-1 flex flex-col items-center gap-2 min-w-0"
          >
            <div
              className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#5a4fff] to-[#8c86ff] transition-all duration-500"
              style={{
                height: point.value != null ? `${(point.value / max) * 100}%` : "4px",
                minHeight: point.value != null ? "8px" : "4px",
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
