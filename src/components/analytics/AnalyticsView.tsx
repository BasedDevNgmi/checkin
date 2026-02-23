"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH, MOTION_DURATION } from "@/lib/motion";
import type { CheckInRow } from "@/types/checkin";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { Flame, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { useAnalyticsModel } from "@/features/analytics/lib/useAnalyticsModel";
import { useEffect, useRef, type ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LinkButton } from "@/components/ui/LinkButton";

interface AnalyticsViewProps {
  checkins: CheckInRow[];
}

const WeekdayChart = dynamic(
  () => import("@/components/analytics/WeekdayChart").then((m) => m.WeekdayChart),
  { ssr: false }
);
const EmotionBars = dynamic(
  () => import("@/components/analytics/EmotionBars").then((m) => m.EmotionBars),
  { ssr: false }
);
const BehaviorRing = dynamic(
  () => import("@/components/analytics/BehaviorRing").then((m) => m.BehaviorRing),
  { ssr: false }
);
const Heatmap = dynamic(
  () => import("@/components/analytics/Heatmap").then((m) => m.Heatmap),
  { ssr: false }
);
const BodyPartBars = dynamic(
  () => import("@/components/analytics/BodyPartBars").then((m) => m.BodyPartBars),
  { ssr: false }
);

function DeferredSection({
  children,
  placeholder,
}: {
  children: ReactNode;
  placeholder: ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const node = anchorRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={anchorRef}>
      {isVisible ? (
        children
      ) : (
        placeholder
      )}
    </div>
  );
}

export function AnalyticsView({ checkins }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
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
          <LinkButton href="/checkin" className="mt-6 gap-2">
            Eerste check-in doen <ChevronRight className="h-4 w-4" />
          </LinkButton>
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
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { value: 7, label: "7d" },
            { value: 30, label: "30d" },
            { value: 90, label: "90d" },
          ]}
          ariaLabel="Periode selecteren"
        />
      </div>

      {/* Stat cards */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION_DURATION.enter, ease: EASE_SMOOTH }}
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
      <DeferredSection
        placeholder={(
          <div className="grid gap-4 lg:grid-cols-2" aria-hidden>
            <div className="glass-card h-[220px] animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
            <div className="glass-card h-[220px] animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
          </div>
        )}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <WeekdayChart data={weekdayData} />
          <Heatmap dayData={heatmapDayData} weeks={Math.min(Math.ceil(period / 7) + 2, 16)} />
        </div>
      </DeferredSection>

      {/* Emotions + Body + Behavior row */}
      <DeferredSection
        placeholder={(
          <div className="grid gap-4 lg:grid-cols-3" aria-hidden>
            <div className="glass-card h-[200px] animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
            <div className="glass-card h-[200px] animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
            <div className="glass-card h-[200px] animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
          </div>
        )}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <EmotionBars data={emotionData} />
          <BodyPartBars data={bodyPartData} />
          <BehaviorRing data={behaviorData} />
        </div>
      </DeferredSection>

      {/* Generated insights */}
      {generatedInsights.length > 0 && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: MOTION_DURATION.emphasis, ease: EASE_SMOOTH }}
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
