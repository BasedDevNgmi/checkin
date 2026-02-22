import type { CheckInRow } from "@/types/checkin";
import type { BodyPartId } from "@/types/checkin";
import { BODY_PART_LABELS, type EmotionStat } from "@/features/analytics/lib/distributions";

interface GenerateInsightsInput {
  period: number;
  completedDays: number;
  avgEnergy: number | null;
  bestWeekday: { day: string; avg: number } | null;
  emotionInsights: EmotionStat[];
  topBodyParts: { part: BodyPartId; count: number }[];
  bewustPct: number | null;
  waardenCheckPct: number | null;
}

export function generateInsights(checkins: CheckInRow[], input: GenerateInsightsInput): string[] {
  const out: string[] = [];
  const {
    period,
    completedDays,
    avgEnergy,
    bestWeekday,
    emotionInsights,
    topBodyParts,
    bewustPct,
    waardenCheckPct,
  } = input;
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
