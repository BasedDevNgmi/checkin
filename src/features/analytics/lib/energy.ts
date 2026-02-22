import type { CheckInRow } from "@/types/checkin";
import { toDayKey } from "@/features/analytics/lib/date";

export interface ChartDatum {
  date: string;
  label: string;
  value: number | null;
}

export function aggregateDailyEnergy(checkins: CheckInRow[]) {
  const byDay = new Map<string, { sum: number; count: number; checkins: number }>();
  for (const row of checkins) {
    const bucketKey = toDayKey(new Date(row.created_at));
    const current = byDay.get(bucketKey) ?? { sum: 0, count: 0, checkins: 0 };
    current.checkins += 1;
    if (row.energy_level != null) {
      current.sum += row.energy_level;
      current.count += 1;
    }
    byDay.set(bucketKey, current);
  }
  return byDay;
}

export function buildChartData(
  period: number,
  start: Date,
  aggregate: Map<string, { sum: number; count: number; checkins: number }>
): ChartDatum[] {
  return Array.from({ length: period }, (_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    const key = toDayKey(d);
    const bucket = aggregate.get(key);
    const avg = bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null;
    return {
      date: key,
      label: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      value: avg,
    };
  });
}

export function computeEnergySummary(chartData: ChartDatum[]) {
  const completedDays = chartData.filter((d) => d.value != null).length;
  const avgEnergy =
    completedDays > 0
      ? Math.round(chartData.filter((d) => d.value != null).reduce((s, d) => s + (d.value ?? 0), 0) / completedDays)
      : null;
  return { completedDays, avgEnergy };
}

export function buildHeatmapDayData(aggregate: Map<string, { sum: number; count: number; checkins: number }>) {
  const map = new Map<string, number>();
  for (const [key, bucket] of aggregate.entries()) {
    if (bucket.count > 0) map.set(key, Math.round(bucket.sum / bucket.count));
  }
  return map;
}
