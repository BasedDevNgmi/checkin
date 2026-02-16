"use client";

import type { CheckInRow } from "@/types/checkin";

interface SummaryCardsProps {
  checkins: CheckInRow[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function SummaryCards({ checkins }: SummaryCardsProps) {
  const recent = checkins.slice(0, 7);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-zen)] backdrop-blur-xl">
      <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        Recente check-ins
      </h3>
      <div className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--text-soft)]">Nog geen check-ins.</p>
        ) : (
          recent.map((c) => (
            <div
              key={c.id}
              className="border-b border-[var(--surface-border)] last:border-0 pb-4 last:pb-0"
            >
              <p className="mb-1 text-xs text-[var(--text-soft)]">
                {formatDate(c.created_at)}
                {c.energy_level != null && ` · ${c.energy_level}% energie`}
              </p>
              {c.thoughts && (
                <p className="text-sm line-clamp-2 text-[var(--text-primary)]">
                  {c.thoughts}
                </p>
              )}
              {c.emotions?.length > 0 && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {c.emotions.join(", ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
