import type { JournalEntry, MoodCheckIn } from "@/core/storage/models";
import { toDayKey } from "@/core/lib/date";

export interface InsightSummary {
  checkInCount: number;
  journalCount: number;
  currentStreak: number;
  averageValence: number | null;
  averageEnergy: number | null;
  topLowMoodTags: string[];
  topHighMoodTags: string[];
  dailyHeatmap: Array<{ day: string; score: number; count: number }>;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / values.length).toFixed(1));
}

function calcStreak(checkIns: MoodCheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const sortedDays = Array.from(new Set(checkIns.map((item) => toDayKey(item.createdAt)))).sort(
    (a, b) => (a > b ? -1 : 1)
  );
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = new Date(sortedDays[i - 1]).getTime();
    const current = new Date(sortedDays[i]).getTime();
    const diffDays = Math.round((prev - current) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
}

function collectTagBuckets(checkIns: MoodCheckIn[], entries: JournalEntry[]) {
  const byCheckIn = new Map(checkIns.map((item) => [item.id, item]));
  const low = new Map<string, number>();
  const high = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.moodLinkId) continue;
    const linkedMood = byCheckIn.get(entry.moodLinkId);
    if (!linkedMood) continue;
    const target = linkedMood.valence <= 4 ? low : linkedMood.valence >= 7 ? high : null;
    if (!target) continue;
    for (const tag of entry.tags) {
      target.set(tag, (target.get(tag) ?? 0) + 1);
    }
  }

  const toTop = (bucket: Map<string, number>) =>
    [...bucket.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

  return { topLowMoodTags: toTop(low), topHighMoodTags: toTop(high) };
}

export function buildInsightSummary(
  checkIns: MoodCheckIn[],
  journalEntries: JournalEntry[]
): InsightSummary {
  const daily = new Map<string, { sum: number; count: number }>();
  for (const item of checkIns) {
    const key = toDayKey(item.createdAt);
    const current = daily.get(key) ?? { sum: 0, count: 0 };
    current.sum += item.valence;
    current.count += 1;
    daily.set(key, current);
  }

  const dailyHeatmap = [...daily.entries()]
    .map(([day, value]) => ({ day, score: Number((value.sum / value.count).toFixed(1)), count: value.count }))
    .sort((a, b) => (a.day > b.day ? 1 : -1));

  return {
    checkInCount: checkIns.length,
    journalCount: journalEntries.length,
    currentStreak: calcStreak(checkIns),
    averageValence: average(checkIns.map((item) => item.valence)),
    averageEnergy: average(checkIns.map((item) => item.energy)),
    ...collectTagBuckets(checkIns, journalEntries),
    dailyHeatmap,
  };
}
