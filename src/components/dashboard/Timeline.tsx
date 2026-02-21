"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
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

const STAGGER_DELAY = 0.04;
const STAGGER_DURATION = 0.3;

export function Timeline({ checkins }: TimelineProps) {
  const reduceMotion = useReducedMotion();
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

  const groupsWithStaggerIndex = useMemo(() => {
    let index = 0;
    return groupedByMonth.map(([monthLabel, entries]) => {
      const items = entries.map((entry) => ({ entry, staggerIndex: index++ }));
      return { monthLabel, items };
    });
  }, [groupedByMonth]);

  if (checkins.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-[var(--surface-border)]" role="tablist" aria-label="Periode">
        {DATE_RANGE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            onClick={() => setDateRange(value)}
            className={`px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 border-b-2 -mb-px ${
              dateRange === value
                ? "border-[var(--accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-soft)] hover:text-[var(--text-primary)]"
            }`}
            aria-selected={dateRange === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek in gedachten of gedrag"
            className="w-full rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus-visible:border-[var(--focus-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] transition"
            aria-label="Zoek entries"
          />
        </div>
        {allEmotions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEmotionFilter(null)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-colors duration-200 ${
                emotionFilter == null
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--text-primary)]"
              }`}
            >
              Alles
            </button>
            {allEmotions.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => setEmotionFilter(emotion)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-colors duration-200 ${
                  emotionFilter === emotion
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--text-primary)]"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        )}
      </div>

      {groupedByMonth.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[var(--text-muted)]">
            Geen entries voor deze filters.
          </p>
        </div>
      ) : (
        <ul className="space-y-8">
          {groupsWithStaggerIndex.map(({ monthLabel, items }) => (
            <li key={monthLabel}>
              <p className="mb-3 mt-2 first:mt-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
                {monthLabel}
              </p>
              <ul className="divide-y divide-[var(--surface-border)]">
                {items.map(({ entry: c, staggerIndex }) => (
                  <motion.li
                    key={c.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: STAGGER_DURATION,
                      delay: reduceMotion ? 0 : staggerIndex * STAGGER_DELAY,
                      ease: EASE_SMOOTH,
                    }}
                  >
                    <Link
                      href={`/entries/${c.id}`}
                      className="flex min-h-[var(--tap-min-height)] items-center gap-3 py-4 transition-colors duration-200 hover:bg-[var(--interactive-hover)] -mx-2 px-2 rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p suppressHydrationWarning className="text-[13px] text-[var(--text-soft)]">
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
                  </motion.li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
