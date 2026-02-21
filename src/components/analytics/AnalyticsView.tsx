"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import type { CheckInRow } from "@/types/checkin";
import { BODY_PART_IDS } from "@/types/checkin";
import type { BodyPartId } from "@/types/checkin";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  Brain,
  Heart,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface AnalyticsViewProps {
  checkins: CheckInRow[];
}

const periods = [
  { label: "7 dagen", value: 7 },
  { label: "30 dagen", value: 30 },
  { label: "90 dagen", value: 90 },
] as const;

const BODY_PART_LABELS: Record<BodyPartId, string> = {
  head: "Hoofd",
  neck: "Nek",
  chest: "Borst",
  shoulder_left: "Schouder L",
  shoulder_right: "Schouder R",
  arm_left: "Arm L",
  arm_right: "Arm R",
  stomach: "Buik",
  hip_left: "Heup L",
  hip_right: "Heup R",
  leg_left: "Been L",
  leg_right: "Been R",
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getEnergyTone(value: number | null) {
  if (value == null) return "bg-[var(--interactive-hover)]";
  if (value >= 75) return "bg-[var(--accent)]";
  if (value >= 50) return "bg-[var(--accent)]/80";
  if (value >= 25) return "bg-[var(--accent)]/50";
  return "bg-[var(--accent)]/30";
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Consecutive days with at least one check-in, from today backwards. */
function computeStreaks(checkins: CheckInRow[], referenceDate: Date): { current: number; longest: number } {
  const daysWithCheckIn = new Set(
    checkins.map((c) => dayKey(new Date(c.created_at)))
  );
  const sortedDays = Array.from(daysWithCheckIn).sort();
  if (sortedDays.length === 0) return { current: 0, longest: 0 };

  const today = dayKey(startOfDay(referenceDate));
  let current = 0;
  let d = new Date(today);
  for (;;) {
    const key = dayKey(d);
    if (!daysWithCheckIn.has(key)) break;
    current++;
    d.setDate(d.getDate() - 1);
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest };
}

function generateInsights(
  checkins: CheckInRow[],
  opts: {
    period: number;
    completedDays: number;
    avgEnergy: number | null;
    bestWeekday: { day: string; avg: number } | null;
    emotionInsights: { emotion: string; avg: number; count: number }[];
    topBodyParts: { part: BodyPartId; count: number }[];
    bewustPct: number | null;
    waardenCheckPct: number | null;
  }
): string[] {
  const out: string[] = [];
  const { period, completedDays, avgEnergy, bestWeekday, emotionInsights, topBodyParts, bewustPct, waardenCheckPct } = opts;

  if (checkins.length === 0) return [];

  const consistency = Math.round((completedDays / period) * 100);
  if (consistency >= 50 && period >= 30) {
    out.push(`Je checkt in ${consistency}% van de dagen in deze periode — een sterk ritme.`);
  } else if (completedDays > 0) {
    out.push(`${completedDays} check-in${completedDays === 1 ? "" : "s"} in deze periode. Kleine stappen tellen.`);
  }

  if (avgEnergy != null && checkins.length >= 3) {
    if (avgEnergy >= 65) out.push(`Je gemiddelde energie staat op ${avgEnergy}% — je zit goed in je vel.`);
    else if (avgEnergy <= 40) out.push(`Je gemiddelde energie is ${avgEnergy}%. Extra aandacht voor rust en kleine momenten kan helpen.`);
  }

  if (bestWeekday && checkins.length >= 5) {
    out.push(`Je voelt je gemiddeld het best op ${bestWeekday.day} (${bestWeekday.avg}% energie).`);
  }

  if (emotionInsights.length > 0) {
    const top = emotionInsights[0];
    const withEnergy = emotionInsights.find((e) => e.avg >= 60);
    if (withEnergy) {
      out.push(`Bij het gevoel "${withEnergy.emotion}" zit je energie vaak hoger (gem. ${withEnergy.avg}%).`);
    }
  }

  if (topBodyParts.length > 0 && topBodyParts[0].count >= 2) {
    const part = BODY_PART_LABELS[topBodyParts[0].part];
    out.push(`Je merkt spanning of sensatie het vaakst op rond je ${part.toLowerCase()}.`);
  }

  if (bewustPct != null && checkins.filter((c) => c.behavior_meta?.bewust_autonoom).length >= 3) {
    if (bewustPct >= 60) out.push("Je handelt vaker bewust dan automatisch — goed zicht op je gedrag.");
    else if (bewustPct <= 40) out.push("Je gedrag is vaker automatisch. Bewust checken kan meer inzicht geven.");
  }

  if (waardenCheckPct != null && waardenCheckPct >= 50) {
    out.push("Je koppelt je gedrag vaak aan je waarden. Dat versterkt bewust handelen.");
  }

  return out.slice(0, 5);
}

export function AnalyticsView({ checkins }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]["value"]>(30);
  const reduceMotion = useReducedMotion();
  const [now] = useState(() => new Date());
  const start = startOfDay(new Date(now.getTime() - (period - 1) * 24 * 60 * 60 * 1000));

  const aggregate = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number; checkins: number }>();
    for (const row of checkins) {
      const date = new Date(row.created_at);
      const bucketKey = dayKey(date);
      const current = byDay.get(bucketKey) ?? { sum: 0, count: 0, checkins: 0 };
      current.checkins += 1;
      if (row.energy_level != null) {
        current.sum += row.energy_level;
        current.count += 1;
      }
      byDay.set(bucketKey, current);
    }
    return byDay;
  }, [checkins]);

  const chartData = useMemo(() => {
    return Array.from({ length: period }, (_, index) => {
      const d = new Date(start);
      d.setDate(start.getDate() + index);
      const key = dayKey(d);
      const bucket = aggregate.get(key);
      const avg = bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null;
      return {
        date: key,
        label: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
        value: avg,
      };
    });
  }, [aggregate, period, start]);

  const heatmapCells = chartData.map((point) => ({
    ...point,
    entries: aggregate.get(point.date)?.checkins ?? 0,
  }));

  const completedDays = heatmapCells.filter((d) => d.entries > 0).length;
  const avgEnergy =
    chartData.filter((d) => d.value != null).length > 0
      ? Math.round(
          chartData
            .filter((d) => d.value != null)
            .reduce((sum, d) => sum + (d.value ?? 0), 0) /
            chartData.filter((d) => d.value != null).length
        )
      : null;
  const bestDay = chartData
    .filter((d) => d.value != null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  const lowDay = chartData
    .filter((d) => d.value != null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(checkins, now),
    [checkins, now]
  );

  const emotionInsights = useMemo(() => {
    const byEmotion = new Map<string, { total: number; count: number }>();
    for (const row of checkins) {
      if (row.energy_level == null) continue;
      for (const emotion of row.emotions ?? []) {
        const current = byEmotion.get(emotion) ?? { total: 0, count: 0 };
        current.total += row.energy_level;
        current.count += 1;
        byEmotion.set(emotion, current);
      }
    }
    return [...byEmotion.entries()]
      .map(([emotion, values]) => ({
        emotion,
        avg: Math.round(values.total / values.count),
        count: values.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [checkins]);

  const weekdayInsight = useMemo(() => {
    const weekdays = new Map<string, { total: number; count: number }>();
    for (const row of checkins) {
      if (row.energy_level == null) continue;
      const weekday = new Date(row.created_at).toLocaleDateString("nl-NL", {
        weekday: "long",
      });
      const current = weekdays.get(weekday) ?? { total: 0, count: 0 };
      current.total += row.energy_level;
      current.count += 1;
      weekdays.set(weekday, current);
    }
    const sorted = [...weekdays.entries()]
      .map(([day, values]) => ({ day, avg: Math.round(values.total / values.count) }))
      .sort((a, b) => b.avg - a.avg);
    return sorted[0] ?? null;
  }, [checkins]);

  const bodyPartCounts = useMemo(() => {
    const counts = new Map<BodyPartId, number>();
    for (const row of checkins) {
      for (const part of row.body_parts ?? []) {
        if (BODY_PART_IDS.includes(part as BodyPartId)) {
          counts.set(part as BodyPartId, (counts.get(part as BodyPartId) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .map(([part, count]) => ({ part, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [checkins]);

  const behaviorInsights = useMemo(() => {
    let bewust = 0;
    let autonoom = 0;
    let waardenYes = 0;
    let waardenTotal = 0;
    for (const row of checkins) {
      const b = row.behavior_meta?.bewust_autonoom;
      if (b === "Bewust") bewust++;
      if (b === "Autonoom") autonoom++;
      if (row.behavior_meta?.waarden_check != null) {
        waardenTotal++;
        if (row.behavior_meta.waarden_check) waardenYes++;
      }
    }
    const totalBa = bewust + autonoom;
    return {
      bewustPct: totalBa > 0 ? Math.round((bewust / totalBa) * 100) : null,
      waardenCheckPct: waardenTotal > 0 ? Math.round((waardenYes / waardenTotal) * 100) : null,
      bewustCount: bewust,
      autonoomCount: autonoom,
    };
  }, [checkins]);

  const generatedInsights = useMemo(
    () =>
      generateInsights(checkins, {
        period,
        completedDays,
        avgEnergy,
        bestWeekday: weekdayInsight,
        emotionInsights,
        topBodyParts: bodyPartCounts,
        bewustPct: behaviorInsights.bewustPct,
        waardenCheckPct: behaviorInsights.waardenCheckPct,
      }),
    [
      checkins,
      period,
      completedDays,
      avgEnergy,
      weekdayInsight,
      emotionInsights,
      bodyPartCounts,
      behaviorInsights.bewustPct,
      behaviorInsights.waardenCheckPct,
    ]
  );

  const isEmpty = checkins.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-8 pb-24">
        <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-elevation)] text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--interactive-hover)]">
            <Sparkles className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h2 className="mt-4 text-[22px] font-semibold text-[var(--text-primary)]">
            Jouw inzichten groeien met elke check-in
          </h2>
          <p className="mt-2 max-w-sm mx-auto text-[13px] text-[var(--text-muted)]">
            Na je eerste check-ins zie je hier energie, patronen, emoties en persoonlijke inzichten.
          </p>
          <Link
            href="/checkin"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-[var(--shadow-elevation)] transition hover:opacity-95 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            Eerste check-in doen <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Hero + period */}
      <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-elevation)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
              Jouw stemming door de tijd
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
              Patronen in energie, emoties en gedrag — alleen voor jou.
            </p>
          </div>
          <div className="inline-flex rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--interactive-hover)] p-1">
            {periods.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-[var(--radius-control)] px-3 py-1.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                  option.value === period
                    ? "bg-[var(--interactive-active)] text-[var(--text-primary)] shadow-[var(--shadow-zen)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] active:bg-[var(--interactive-active)]"
                }`}
                aria-pressed={option.value === period}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* At a glance: streaks + stats */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <div className="flex items-center gap-2 text-[var(--text-soft)]">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs font-medium uppercase tracking-wider">Huidige reeks</span>
          </div>
          <p suppressHydrationWarning className="mt-2 text-[22px] font-semibold text-[var(--text-primary)]">
            {currentStreak} {currentStreak === 1 ? "dag" : "dagen"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            opeenvolgende dagen met check-in
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <div className="flex items-center gap-2 text-[var(--text-soft)]">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Beste reeks</span>
          </div>
          <p className="mt-2 text-[22px] font-semibold text-[var(--text-primary)]">
            {longestStreak} {longestStreak === 1 ? "dag" : "dagen"}
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-soft)]">
            Gem. energie
          </p>
          <p className="mt-2 text-[22px] font-semibold text-[var(--text-primary)]">
            {avgEnergy == null ? "—" : `${avgEnergy}%`}
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-soft)]">
            Consistentie
          </p>
          <p className="mt-2 text-[22px] font-semibold text-[var(--text-primary)]">
            {Math.round((completedDays / period) * 100)}%
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {completedDays} / {period} dagen
          </p>
        </div>
      </motion.section>

      <EnergyChart
        data={chartData}
        title={`Energie trend (${period} dagen)`}
        subtitle="Dagelijks gemiddelde op basis van je check-ins"
      />

      {/* Heatmap + best/low day */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] lg:col-span-2">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Kalender heatmap
          </h2>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Donkerder = hogere energie. Klik of hover voor details.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {heatmapCells.map((cell) => (
              <div key={cell.date} className="space-y-1 text-center">
                <div
                  className={`h-9 rounded-[var(--radius-control)] border border-[var(--surface-border)] ${getEnergyTone(cell.value)}`}
                  title={`${cell.label}: ${cell.value ?? "geen score"}${
                    cell.entries > 0 ? `, ${cell.entries} check-in(s)` : ""
                  }`}
                />
                <p suppressHydrationWarning className="text-[10px] text-[var(--text-soft)]">
                  {new Date(cell.date).toLocaleDateString("nl-NL", { weekday: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-elevation)]">
            <p className="text-xs text-[var(--text-soft)]">Beste dag</p>
            <p className="mt-1 text-[17px] font-semibold text-[var(--text-primary)]">
              {bestDay ? `${bestDay.label} (${bestDay.value}%)` : "—"}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-elevation)]">
            <p className="text-xs text-[var(--text-soft)]">Zwaarste dag</p>
            <p className="mt-1 text-[17px] font-semibold text-[var(--text-primary)]">
              {lowDay ? `${lowDay.label} (${lowDay.value}%)` : "—"}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Emotions + Body + Gedrag */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Emotie × energie
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Gemiddelde energie wanneer deze emotie aanwezig was.
          </p>
          {emotionInsights.length === 0 ? (
            <p className="mt-4 text-[13px] text-[var(--text-muted)]">Nog te weinig data.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {emotionInsights.map((item) => (
                <li
                  key={item.emotion}
                  className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--interactive-hover)] px-3 py-2"
                >
                  <span className="text-[13px] text-[var(--text-primary)]">{item.emotion}</span>
                  <span className="text-[13px] font-semibold text-[var(--accent)]">
                    {item.avg}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Lichaam
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Gebieden waar je het vaakst iets merkt.
          </p>
          {bodyPartCounts.length === 0 ? (
            <p className="mt-4 text-[13px] text-[var(--text-muted)]">Nog geen data.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {bodyPartCounts.map(({ part, count }) => (
                <li
                  key={part}
                  className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--interactive-hover)] px-3 py-2"
                >
                  <span className="text-[13px] text-[var(--text-primary)]">
                    {BODY_PART_LABELS[part]}
                  </span>
                  <span className="text-[13px] font-medium text-[var(--text-muted)]">
                    {count}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Gedrag
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Bewust vs automatisch, waarden-check.
          </p>
          <div className="mt-4 space-y-3 text-[13px] text-[var(--text-primary)]">
            {behaviorInsights.bewustPct != null ? (
              <p>
                Bewust:{" "}
                <span className="font-semibold text-[var(--accent)]">
                  {behaviorInsights.bewustPct}%
                </span>{" "}
                · Autonoom:{" "}
                <span className="font-semibold">
                  {100 - behaviorInsights.bewustPct}%
                </span>
              </p>
            ) : (
              <p className="text-[var(--text-muted)]">Nog geen gedrag-data.</p>
            )}
            {behaviorInsights.waardenCheckPct != null && (
              <p>
                Waarden-check ja:{" "}
                <span className="font-semibold text-[var(--accent)]">
                  {behaviorInsights.waardenCheckPct}%
                </span>
              </p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Generated insights */}
      {generatedInsights.length > 0 && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: EASE_SMOOTH }}
          className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-elevation)]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Persoonlijke inzichten
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Op basis van jouw check-ins.
          </p>
          <ul className="mt-4 space-y-3" role="list">
            {generatedInsights.map((text, i) => (
              <li
                key={i}
                className="flex gap-3 text-[13px] text-[var(--text-primary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-soft)]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Rhythm summary (weekday) */}
      {weekdayInsight && (
        <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Persoonlijk ritme
          </h2>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Weekdag waarop je gemiddeld de hoogste energie hebt.
          </p>
          <p className="mt-3 text-[13px] text-[var(--text-primary)]">
            Beste weekdag:{" "}
            <span className="font-semibold text-[var(--accent)]">
              {weekdayInsight.day} (gem. {weekdayInsight.avg}% energie)
            </span>
          </p>
        </section>
      )}
    </div>
  );
}
