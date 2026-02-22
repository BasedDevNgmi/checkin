"use client";

import { useMemo } from "react";
import type { CheckInRow } from "@/types/checkin";
import { startOfDay } from "@/features/analytics/lib/date";
import { computeStreaks } from "@/features/analytics/lib/streaks";
import {
  aggregateDailyEnergy,
  buildChartData,
  buildHeatmapDayData,
  computeEnergySummary,
} from "@/features/analytics/lib/energy";
import {
  computeBehaviorData,
  computeBehaviorInsights,
  computeBodyPartData,
  computeBodyPartRaw,
  computeEmotionData,
  computeWeekdayData,
  pickBestWeekday,
} from "@/features/analytics/lib/distributions";
import { generateInsights } from "@/features/analytics/lib/insights";

export function useAnalyticsModel(checkins: CheckInRow[], period: number, now: Date) {
  const start = useMemo(
    () => startOfDay(new Date(now.getTime() - (period - 1) * 24 * 60 * 60 * 1000)),
    [now, period]
  );

  const aggregate = useMemo(() => aggregateDailyEnergy(checkins), [checkins]);
  const chartData = useMemo(() => buildChartData(period, start, aggregate), [aggregate, period, start]);
  const heatmapDayData = useMemo(() => buildHeatmapDayData(aggregate), [aggregate]);
  const { completedDays, avgEnergy } = useMemo(() => computeEnergySummary(chartData), [chartData]);
  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(checkins, now),
    [checkins, now]
  );
  const weekdayData = useMemo(() => computeWeekdayData(checkins, start), [checkins, start]);
  const bestWeekday = useMemo(() => pickBestWeekday(weekdayData), [weekdayData]);
  const emotionData = useMemo(() => computeEmotionData(checkins), [checkins]);
  const bodyPartData = useMemo(() => computeBodyPartData(checkins), [checkins]);
  const bodyPartCountsRaw = useMemo(() => computeBodyPartRaw(checkins), [checkins]);
  const behaviorData = useMemo(() => computeBehaviorData(checkins), [checkins]);
  const behaviorInsights = useMemo(() => computeBehaviorInsights(checkins), [checkins]);

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
    [
      avgEnergy,
      behaviorInsights.bewustPct,
      behaviorInsights.waardenCheckPct,
      bestWeekday,
      bodyPartCountsRaw,
      checkins,
      completedDays,
      emotionData,
      period,
    ]
  );

  return {
    start,
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
  };
}
