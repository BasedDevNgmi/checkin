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
    <div className="rounded-2xl bg-white/80 shadow-md shadow-slate-200/50 border border-white/60 p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Recente check-ins
      </h3>
      <div className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm">Nog geen check-ins.</p>
        ) : (
          recent.map((c) => (
            <div
              key={c.id}
              className="border-b border-slate-100 last:border-0 pb-4 last:pb-0"
            >
              <p className="text-xs text-slate-400 mb-1">
                {formatDate(c.created_at)}
                {c.energy_level != null && ` · ${c.energy_level}% energie`}
              </p>
              {c.thoughts && (
                <p className="text-slate-700 text-sm line-clamp-2">
                  {c.thoughts}
                </p>
              )}
              {c.emotions?.length > 0 && (
                <p className="text-slate-500 text-xs mt-1">
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
