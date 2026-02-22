"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import type { CheckInRow } from "@/types/checkin";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { WeekdayChart } from "@/components/analytics/WeekdayChart";
import { EmotionBars } from "@/components/analytics/EmotionBars";
import { BehaviorRing } from "@/components/analytics/BehaviorRing";
import { Heatmap } from "@/components/analytics/Heatmap";
import { BodyPartBars } from "@/components/analytics/BodyPartBars";
import Link from "next/link";
import { Flame, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { useAnalyticsModel } from "@/features/analytics/lib/useAnalyticsModel";

interface AnalyticsViewProps {
  checkins: CheckInRow[];
}

const periods = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const;

export function AnalyticsView({ checkins }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]["value"]>(30);
  const reduceMotion = useReducedMotion();
  const [now] = useState(() => new Date());
  const {
    chartData,
    heatmapDayData,
    completedDays,
    avgEnergy,
    currentStreak,
    longestStreak,
    weekdayData,
    emotionData,
    bodyPartData,
    behaviorData,
    generatedInsights,
  } = useAnalyticsModel(checkins, period, now);
  const pointsWithData = chartData.filter((point) => point.value != null).length;
  const hasLowDataDensity = pointsWithData < 4;

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
    <div className="space-y-6 pb-28 md:pb-10">
      {/* Header with period selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
      {hasLowDataDensity && (
        <div className="glass-panel rounded-[var(--radius-control)] px-3.5 py-2.5">
          <p className="text-[12px] text-[var(--text-muted)]">
            Nog weinig meetpunten in deze periode. Met meer check-ins worden trends scherper.
          </p>
        </div>
      )}
      <EnergyChart
        data={chartData}
        title={`Energie trend (${period}d)`}
        subtitle={
          hasLowDataDensity
            ? "Vroege indicatie op basis van je recente check-ins"
            : "Dagelijks gemiddelde op basis van je check-ins"
        }
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
