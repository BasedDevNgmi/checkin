"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import { EMOTION_OPTIONS, type CheckInRow } from "@/types/checkin";
import { Search, SlidersHorizontal } from "lucide-react";

const EMOJI_MAP: Map<string, string> = new Map(EMOTION_OPTIONS.map((e) => [e.id, e.emoji]));

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

function dayDividerLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (diff === 0) return "Vandaag";
  if (diff === 1) return "Gisteren";
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type DateRangePreset = "all" | "week" | "month" | "quarter";

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "week", label: "7d" },
  { value: "month", label: "30d" },
  { value: "quarter", label: "90d" },
  { value: "all", label: "Alles" },
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
  const [showFilters, setShowFilters] = useState(false);
  const filtersPanelId = useId();

  const allEmotions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of checkins) {
      for (const emotion of entry.emotions ?? []) {
        counts.set(emotion, (counts.get(emotion) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion)
      .slice(0, 6);
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

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, CheckInRow[]>();
    for (const entry of filtered) {
      const key = entry.created_at.slice(0, 10);
      const current = groups.get(key) ?? [];
      current.push(entry);
      groups.set(key, current);
    }
    return [...groups.entries()];
  }, [filtered]);

  const groupsWithStaggerIndex = useMemo(() => {
    let index = 0;
    return groupedByDay.map(([dayKey, entries]) => {
      const items = entries.map((entry) => ({ entry, staggerIndex: index++ }));
      return { dayKey, items };
    });
  }, [groupedByDay]);

  if (checkins.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--interactive-hover)] p-0.5"
          aria-label="Periode"
        >
          {DATE_RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateRange(value)}
              className={`rounded-[var(--radius-small)] px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                dateRange === value
                  ? "bg-[var(--surface)] text-[var(--text-primary)]"
                  : "text-[var(--text-soft)] hover:text-[var(--text-primary)]"
              }`}
              aria-pressed={dateRange === value}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters || Boolean(query) || Boolean(emotionFilter)}
          aria-controls={filtersPanelId}
          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-control)] border px-3 text-[13px] font-medium transition-colors duration-200 ${
            showFilters || query || emotionFilter
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
        </button>
      </div>

      {(showFilters || query || emotionFilter) && (
        <div
          id={filtersPanelId}
          className="space-y-3 rounded-[var(--radius-control)] border border-[var(--surface-border)]/80 bg-[var(--surface)]/80 p-3.5"
        >
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
                    ? "border-[var(--surface-border-strong)] bg-[var(--interactive-hover)] text-[var(--text-primary)]"
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
                      ? "border-[var(--surface-border-strong)] bg-[var(--interactive-hover)] text-[var(--text-primary)]"
                      : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          )}
          {(query || emotionFilter) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setEmotionFilter(null);
              }}
              className="text-[12px] font-medium text-[var(--accent)] hover:opacity-80"
            >
              Wis filters
            </button>
          )}
        </div>
      )}

      {groupedByDay.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[var(--text-muted)]">
            Geen entries voor deze filters.
          </p>
        </div>
      ) : (
        <ul className="space-y-7">
          {groupsWithStaggerIndex.map(({ dayKey, items }) => (
            <li key={dayKey}>
              <p className="mb-3 mt-1 first:mt-0 text-[12px] font-medium text-[var(--text-soft)]">
                {dayDividerLabel(dayKey)}
              </p>
              <ul className="space-y-2.5">
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
                      className="block rounded-[var(--radius-card)] border border-[var(--surface-border)]/70 bg-[var(--surface)] px-4 py-3.5 sm:px-5 transition-colors duration-200 hover:border-[var(--surface-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
