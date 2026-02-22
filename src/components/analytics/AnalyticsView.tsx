"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import type { CheckInRow } from "@/types/checkin";
import { BODY_PART_IDS } from "@/types/checkin";
import type { BodyPartId } from "@/types/checkin";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { WeekdayChart, type WeekdayDatum } from "@/components/analytics/WeekdayChart";
import { EmotionBars, type EmotionStat } from "@/components/analytics/EmotionBars";
import { BehaviorRing, type BehaviorDatum } from "@/components/analytics/BehaviorRing";
import { Heatmap } from "@/components/analytics/Heatmap";
import { BodyPartBars, type BodyPartStat } from "@/components/analytics/BodyPartBars";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface AnalyticsViewProps {
  checkins: CheckInRow[];
}

const periods = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
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

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function computeStreaks(checkins: CheckInRow[], referenceDate: Date): { current: number; longest: number } {
  const daysWithCheckIn = new Set(checkins.map((c) => dayKey(new Date(c.created_at))));
  const sortedDays = Array.from(daysWithCheckIn).sort();
  if (sortedDays.length === 0) return { current: 0, longest: 0 };

  const today = dayKey(startOfDay(referenceDate));
  let current = 0;
  const d = new Date(today);
  for (;;) {
    if (!daysWithCheckIn.has(dayKey(d))) break;
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

const WEEKDAY_ORDER = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const WEEKDAY_SHORT: Record<string, string> = {
  maandag: "Ma", dinsdag: "Di", woensdag: "Wo", donderdag: "Do",
  vrijdag: "Vr", zaterdag: "Za", zondag: "Zo",
};

function generateInsights(
  checkins: CheckInRow[],
  opts: {
    period: number;
    completedDays: number;
    avgEnergy: number | null;
    bestWeekday: { day: string; avg: number } | null;
    emotionInsights: EmotionStat[];
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
    out.push(`Je checkt in ${consistency}% van de dagen — een sterk ritme.`);
  } else if (completedDays > 0) {
    out.push(`${completedDays} check-in${completedDays === 1 ? "" : "s"} in deze periode. Kleine stappen tellen.`);
  }

  if (avgEnergy != null && checkins.length >= 3) {
    if (avgEnergy >= 65) out.push(`Gemiddelde energie ${avgEnergy}% — je zit goed in je vel.`);
    else if (avgEnergy <= 40) out.push(`Gemiddelde energie ${avgEnergy}%. Extra rust kan helpen.`);
  }

  if (bestWeekday && checkins.length >= 5) {
    out.push(`Beste dag: ${bestWeekday.day} (gem. ${bestWeekday.avg}% energie).`);
  }

  const withEnergy = emotionInsights.find((e) => e.avgEnergy >= 60);
  if (withEnergy) {
    out.push(`Bij "${withEnergy.emotion}" zit je energie vaak hoger (gem. ${withEnergy.avgEnergy}%).`);
  }

  if (topBodyParts.length > 0 && topBodyParts[0].count >= 2) {
    const part = BODY_PART_LABELS[topBodyParts[0].part];
    out.push(`Meest genoemde spanning: rond je ${part.toLowerCase()}.`);
  }

  if (bewustPct != null && checkins.filter((c) => c.behavior_meta?.bewust_autonoom).length >= 3) {
    if (bewustPct >= 60) out.push("Je handelt vaker bewust dan automatisch.");
    else if (bewustPct <= 40) out.push("Je gedrag is vaker automatisch — bewust checken kan helpen.");
  }

  if (waardenCheckPct != null && waardenCheckPct >= 50) {
    out.push("Je koppelt gedrag vaak aan je waarden — goed bezig.");
  }

  return out.slice(0, 4);
}

export function AnalyticsView({ checkins }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]["value"]>(30);
  const reduceMotion = useReducedMotion();
  const [now] = useState(() => new Date());
  const start = startOfDay(new Date(now.getTime() - (period - 1) * 24 * 60 * 60 * 1000));

  const aggregate = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number; checkins: number }>();
    for (const row of checkins) {
      const bucketKey = dayKey(new Date(row.created_at));
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
      return { date: key, label: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }), value: avg };
    });
  }, [aggregate, period, start]);

  const heatmapDayData = useMemo(() => {
    const map = new Map<string, number>();
    for (const [key, bucket] of aggregate.entries()) {
      if (bucket.count > 0) map.set(key, Math.round(bucket.sum / bucket.count));
    }
    return map;
  }, [aggregate]);

  const completedDays = chartData.filter((d) => d.value != null).length;
  const avgEnergy = completedDays > 0
    ? Math.round(chartData.filter((d) => d.value != null).reduce((s, d) => s + (d.value ?? 0), 0) / completedDays)
    : null;

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(checkins, now),
    [checkins, now]
  );

  const weekdayData = useMemo<WeekdayDatum[]>(() => {
    const weekdays = new Map<string, { total: number; count: number }>();
    for (const row of checkins) {
      if (row.energy_level == null) continue;
      const d = new Date(row.created_at);
      if (d < start) continue;
      const weekday = d.toLocaleDateString("nl-NL", { weekday: "long" });
      const current = weekdays.get(weekday) ?? { total: 0, count: 0 };
      current.total += row.energy_level;
      current.count += 1;
      weekdays.set(weekday, current);
    }
    return WEEKDAY_ORDER.map((w) => {
      const d = weekdays.get(w);
      return { day: WEEKDAY_SHORT[w] ?? w, avg: d ? Math.round(d.total / d.count) : 0, count: d?.count ?? 0 };
    });
  }, [checkins, start]);

  const bestWeekday = useMemo(() => {
    const filled = weekdayData.filter((d) => d.count > 0);
    if (filled.length === 0) return null;
    const best = filled.sort((a, b) => b.avg - a.avg)[0];
    return { day: best.day, avg: best.avg };
  }, [weekdayData]);

  const emotionData = useMemo<EmotionStat[]>(() => {
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
      .map(([emotion, values]) => ({ emotion, avgEnergy: Math.round(values.total / values.count), count: values.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [checkins]);

  const bodyPartData = useMemo<BodyPartStat[]>(() => {
    const counts = new Map<string, number>();
    for (const row of checkins) {
      for (const part of row.body_parts ?? []) {
        if (BODY_PART_IDS.includes(part as BodyPartId)) {
          const label = BODY_PART_LABELS[part as BodyPartId];
          counts.set(label, (counts.get(label) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .map(([part, count]) => ({ part, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [checkins]);

  const bodyPartCountsRaw = useMemo(() => {
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

  const behaviorData = useMemo<BehaviorDatum[]>(() => {
    let bewust = 0;
    let autonoom = 0;
    for (const row of checkins) {
      const b = row.behavior_meta?.bewust_autonoom;
      if (b === "Bewust") bewust++;
      if (b === "Autonoom") autonoom++;
    }
    const result: BehaviorDatum[] = [];
    if (bewust > 0) result.push({ name: "Bewust", value: bewust });
    if (autonoom > 0) result.push({ name: "Autonoom", value: autonoom });
    return result;
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
    };
  }, [checkins]);

  const generatedInsights = useMemo(
    () =>
      generateInsights(checkins, {
        period,
        completedDays,
        avgEnergy,
        bestWeekday,
        emotionInsights: emotionData,
        topBodyParts: bodyPartCountsRaw,
        bewustPct: behaviorInsights.bewustPct,
        waardenCheckPct: behaviorInsights.waardenCheckPct,
      }),
    [checkins, period, completedDays, avgEnergy, bestWeekday, emotionData, bodyPartCountsRaw, behaviorInsights.bewustPct, behaviorInsights.waardenCheckPct]
  );

  if (checkins.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <section className="glass-card rounded-[var(--radius-card)] p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-elevated)]">
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
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-[var(--shadow-elevation)] transition hover:brightness-[1.04] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            Eerste check-in doen <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-[var(--text-primary)] tracking-tight">Inzichten</h1>
          <p className="text-xs text-[var(--text-muted)]">Patronen in energie, emoties en gedrag</p>
        </div>
        <div className="glass-panel inline-flex rounded-[var(--radius-card)] p-0.5">
          {periods.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-[var(--radius-control)] px-3 py-1.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                option.value === period
                  ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-elevation)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              aria-pressed={option.value === period}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_SMOOTH }}
        className="grid gap-3 grid-cols-2 lg:grid-cols-4"
      >
        <div className="glass-card rounded-[var(--radius-card)] p-4">
          <div className="flex items-center gap-1.5 text-[var(--text-soft)]">
            <Flame className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Reeks</span>
          </div>
          <p suppressHydrationWarning className="mt-1.5 text-xl font-semibold text-[var(--text-primary)] tabular-nums">
            {currentStreak} <span className="text-[13px] font-normal text-[var(--text-muted)]">{currentStreak === 1 ? "dag" : "dagen"}</span>
          </p>
        </div>
        <div className="glass-card rounded-[var(--radius-card)] p-4">
          <div className="flex items-center gap-1.5 text-[var(--text-soft)]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Record</span>
          </div>
          <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)] tabular-nums">
            {longestStreak} <span className="text-[13px] font-normal text-[var(--text-muted)]">{longestStreak === 1 ? "dag" : "dagen"}</span>
          </p>
        </div>
        <div className="glass-card rounded-[var(--radius-card)] p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-soft)]">Gem. energie</span>
          <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)] tabular-nums">
            {avgEnergy == null ? "—" : `${avgEnergy}%`}
          </p>
        </div>
        <div className="glass-card rounded-[var(--radius-card)] p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-soft)]">Consistentie</span>
          <p className="mt-1.5 text-xl font-semibold text-[var(--text-primary)] tabular-nums">
            {Math.round((completedDays / period) * 100)}%
            <span className="text-[13px] font-normal text-[var(--text-muted)]"> ({completedDays}/{period}d)</span>
          </p>
        </div>
      </motion.div>

      {/* Energy trend chart */}
      <EnergyChart
        data={chartData}
        title={`Energie trend (${period}d)`}
        subtitle="Dagelijks gemiddelde op basis van je check-ins"
      />

      {/* Weekday + Heatmap row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <WeekdayChart data={weekdayData} />
        <Heatmap dayData={heatmapDayData} weeks={Math.min(Math.ceil(period / 7) + 2, 16)} />
      </div>

      {/* Emotions + Body + Behavior row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EmotionBars data={emotionData} />
        <BodyPartBars data={bodyPartData} />
        <BehaviorRing data={behaviorData} />
      </div>

      {/* Generated insights */}
      {generatedInsights.length > 0 && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
          className="glass-card rounded-[var(--radius-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Persoonlijke inzichten</h2>
          </div>
          <ul className="mt-3 space-y-2" role="list">
            {generatedInsights.map((text, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-[var(--text-primary)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </div>
  );
}
