import type { CheckInRow } from "@/types/checkin";
import { BODY_PART_IDS, type BodyPartId } from "@/types/checkin";

export const BODY_PART_LABELS: Record<BodyPartId, string> = {
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

const WEEKDAY_ORDER = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const WEEKDAY_SHORT: Record<string, string> = {
  maandag: "Ma",
  dinsdag: "Di",
  woensdag: "Wo",
  donderdag: "Do",
  vrijdag: "Vr",
  zaterdag: "Za",
  zondag: "Zo",
};

export interface WeekdayDatum {
  day: string;
  avg: number;
  count: number;
}

export interface EmotionStat {
  emotion: string;
  count: number;
  avgEnergy: number;
}

export interface BodyPartStat {
  part: string;
  count: number;
}

export interface BehaviorDatum {
  name: string;
  value: number;
}

export function computeWeekdayData(checkins: CheckInRow[], start: Date): WeekdayDatum[] {
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
}

export function pickBestWeekday(weekdayData: WeekdayDatum[]) {
  const filled = weekdayData.filter((d) => d.count > 0);
  if (filled.length === 0) return null;
  const best = [...filled].sort((a, b) => b.avg - a.avg)[0];
  return { day: best.day, avg: best.avg };
}

export function computeEmotionData(checkins: CheckInRow[]): EmotionStat[] {
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
      avgEnergy: Math.round(values.total / values.count),
      count: values.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function computeBodyPartData(checkins: CheckInRow[]): BodyPartStat[] {
  const counts = new Map<string, number>();
  for (const row of checkins) {
    for (const part of row.body_parts ?? []) {
      if (!BODY_PART_IDS.includes(part as BodyPartId)) continue;
      const label = BODY_PART_LABELS[part as BodyPartId];
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([part, count]) => ({ part, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function computeBodyPartRaw(checkins: CheckInRow[]) {
  const counts = new Map<BodyPartId, number>();
  for (const row of checkins) {
    for (const part of row.body_parts ?? []) {
      if (!BODY_PART_IDS.includes(part as BodyPartId)) continue;
      counts.set(part as BodyPartId, (counts.get(part as BodyPartId) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([part, count]) => ({ part, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function computeBehaviorData(checkins: CheckInRow[]): BehaviorDatum[] {
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
}

export function computeBehaviorInsights(checkins: CheckInRow[]) {
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
}
