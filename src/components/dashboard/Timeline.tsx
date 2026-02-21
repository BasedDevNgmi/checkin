"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import { EMOTION_OPTIONS, type CheckInRow } from "@/types/checkin";
import { Search } from "lucide-react";

const EMOJI_MAP = new Map(EMOTION_OPTIONS.map((e) => [e.id, e.emoji]));

function energyColor(level: number): string {
  if (level >= 70) return "var(--text-success)";
  if (level >= 40) return "#d9a038";
  return "var(--text-error)";
}

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
              <p className="mb-4 mt-1 first:mt-0 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-soft)]">
                {monthLabel}
              </p>
              <ul className="space-y-3">
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
                      className="block rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] shadow-[var(--shadow-elevation)] px-4 py-4 sm:px-5 transition-shadow duration-200 hover:shadow-[var(--shadow-zen)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p suppressHydrationWarning className="text-[13px] font-medium text-[var(--text-muted)]">
                          {formatDate(c.created_at)}
                        </p>
                        {c.energy_level != null && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="h-1 w-12 rounded-full bg-[var(--interactive-hover)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${c.energy_level}%`,
                                  backgroundColor: energyColor(c.energy_level),
                                }}
                              />
                            </div>
                            <span className="text-[12px] tabular-nums font-medium" style={{ color: energyColor(c.energy_level) }}>
                              {c.energy_level}%
                            </span>
                          </div>
                        )}
                      </div>

                      {c.thoughts ? (
                        <p className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-[var(--text-primary)]">
                          {c.thoughts}
                        </p>
                      ) : (
                        <p className="mt-2 text-[15px] font-medium text-[var(--text-primary)]">
                          Check-in
                        </p>
                      )}

                      {c.emotions && c.emotions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {c.emotions.map((emotion) => (
                            <span
                              key={emotion}
                              className="inline-flex items-center gap-1 rounded-full border border-[var(--surface-border)] bg-[var(--interactive-hover)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--text-muted)]"
                            >
                              {EMOJI_MAP.get(emotion) && (
                                <span aria-hidden>{EMOJI_MAP.get(emotion)}</span>
                              )}
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
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
