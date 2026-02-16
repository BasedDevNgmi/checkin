"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CheckInRow } from "@/types/checkin";

interface TimelineProps {
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

export function Timeline({ checkins }: TimelineProps) {
  const [query, setQuery] = useState("");
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);

  const allEmotions = useMemo(() => {
    return Array.from(new Set(checkins.flatMap((entry) => entry.emotions ?? []))).slice(0, 8);
  }, [checkins]);

  const filtered = useMemo(() => {
    return checkins.filter((entry) => {
      const matchesEmotion = emotionFilter ? entry.emotions.includes(emotionFilter) : true;
      const matchesQuery = query
        ? `${entry.thoughts ?? ""} ${(entry.behavior_meta?.activity_now ?? "")}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      return matchesEmotion && matchesQuery;
    });
  }, [checkins, emotionFilter, query]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, CheckInRow[]>();
    for (const entry of filtered) {
      const date = new Date(entry.created_at);
      const key = date.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
      const current = groups.get(key) ?? [];
      current.push(entry);
      groups.set(key, current);
    }
    return [...groups.entries()];
  }, [filtered]);

  if (checkins.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)]/80 bg-[var(--surface-glass)] p-3 shadow-[var(--shadow-zen)] backdrop-blur-lg">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek in gedachten of gedrag..."
            className="min-w-0 flex-1 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
            aria-label="Zoek entries"
          />
          {allEmotions.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setEmotionFilter(null)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  emotionFilter == null
                    ? "bg-[var(--interactive-active)] text-[var(--text-primary)]"
                    : "bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]"
                }`}
              >
                Alles
              </button>
              {allEmotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => setEmotionFilter(emotion)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    emotionFilter === emotion
                      ? "bg-[var(--interactive-active)] text-[var(--text-primary)]"
                      : "bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>

      {groupedByMonth.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 text-sm text-[var(--text-muted)]">
          Geen entries gevonden voor je huidige filters.
        </div>
      ) : (
        groupedByMonth.map(([monthLabel, entries]) => (
          <section key={monthLabel} className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-soft)]">
              {monthLabel}
            </h3>
            <ul className="space-y-4">
              {entries.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/entries/${c.id}`}
                    className="block rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-lg transition hover:bg-[var(--interactive-hover)]"
                  >
                    <p className="mb-2 text-xs text-[var(--text-soft)]">
                      {formatDate(c.created_at)}
                      {c.energy_level != null && ` · ${c.energy_level}% energie`}
                    </p>
                    {c.thoughts ? (
                      <p className="mb-2 line-clamp-2 text-sm text-[var(--text-primary)]">
                        {c.thoughts}
                      </p>
                    ) : null}
                    {c.emotions?.length > 0 ? (
                      <p className="text-xs text-[var(--text-muted)]">{c.emotions.join(", ")}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
