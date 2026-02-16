"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CheckInRow } from "@/types/checkin";
import { Search } from "lucide-react";

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

type DateRangePreset = "all" | "week" | "month" | "quarter";

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "week", label: "Deze week" },
  { value: "month", label: "Deze maand" },
  { value: "quarter", label: "3 maanden" },
];

function getRangeStart(preset: DateRangePreset): number | null {
  const now = Date.now();
  switch (preset) {
    case "all":
      return null;
    case "week": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      const dayOfWeek = d.getDay();
      const monday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      d.setDate(d.getDate() - monday);
      return d.getTime();
    }
    case "month": {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "quarter": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    default:
      return null;
  }
}

export function Timeline({ checkins }: TimelineProps) {
  const [query, setQuery] = useState("");
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");

  const allEmotions = useMemo(() => {
    return Array.from(new Set(checkins.flatMap((entry) => entry.emotions ?? []))).slice(0, 8);
  }, [checkins]);

  const rangeStart = getRangeStart(dateRange);

  const filtered = useMemo(() => {
    return checkins.filter((entry) => {
      if (rangeStart != null) {
        const created = new Date(entry.created_at).getTime();
        if (created < rangeStart) return false;
      }
      const matchesEmotion = emotionFilter ? entry.emotions?.includes(emotionFilter) : true;
      const matchesQuery = query
        ? `${entry.thoughts ?? ""} ${(entry.behavior_meta?.activity_now ?? "")}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      return matchesEmotion && matchesQuery;
    });
  }, [checkins, emotionFilter, query, rangeStart]);

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
      {/* Segmented control: date range */}
      <div className="rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-1 shadow-sm backdrop-blur-xl">
        <div className="flex gap-0.5" role="tablist" aria-label="Periode">
          {DATE_RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              onClick={() => setDateRange(value)}
              className={`flex-1 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition ${
                dateRange === value
                  ? "bg-[var(--interactive-active)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              }`}
              aria-selected={dateRange === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + emotion filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek in gedachten of gedrag"
            className="w-full rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] py-2.5 pl-10 pr-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] backdrop-blur-xl focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            aria-label="Zoek entries"
          />
        </div>
        {allEmotions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEmotionFilter(null)}
              className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                emotionFilter == null
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              Alles
            </button>
            {allEmotions.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => setEmotionFilter(emotion)}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                  emotionFilter === emotion
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {groupedByMonth.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-5 py-8 text-center backdrop-blur-xl">
          <p className="text-[15px] text-[var(--text-muted)]">
            Geen entries voor deze filters.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {groupedByMonth.map(([monthLabel, entries]) => (
            <li key={monthLabel}>
              <p className="mb-2 mt-5 first:mt-0 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
                {monthLabel}
              </p>
              <ul className="space-y-1">
                {entries.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/entries/${c.id}`}
                      className="flex min-h-[var(--tap-min-height)] items-center gap-3 rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-4 py-3.5 shadow-sm backdrop-blur-xl transition hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[var(--text-soft)]">
                          {formatDate(c.created_at)}
                          {c.energy_level != null && ` · ${c.energy_level}%`}
                        </p>
                        {c.thoughts ? (
                          <p className="mt-0.5 line-clamp-2 text-[15px] font-medium text-[var(--text-primary)]">
                            {c.thoughts}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[15px] font-medium text-[var(--text-primary)]">
                            Check-in
                          </p>
                        )}
                        {c.emotions && c.emotions.length > 0 && (
                          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                            {c.emotions.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="text-[var(--text-soft)]" aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
