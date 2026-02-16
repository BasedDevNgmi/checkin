import type { CheckInRow } from "@/types/checkin";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayKey(dateLike: string | Date): string {
  const date = typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike);
  return date.toISOString().slice(0, 10);
}

export function getSortedCheckins(checkins: CheckInRow[]): CheckInRow[] {
  return [...checkins].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getUniqueCheckinDays(checkins: CheckInRow[]): number {
  return new Set(checkins.map((row) => toDayKey(row.created_at))).size;
}

export function getCurrentStreak(checkins: CheckInRow[]): number {
  const sorted = getSortedCheckins(checkins);
  if (sorted.length === 0) return 0;

  const uniqueDays = Array.from(new Set(sorted.map((row) => toDayKey(row.created_at))));
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prev = new Date(uniqueDays[i - 1]).getTime();
    const current = new Date(uniqueDays[i]).getTime();
    const diffDays = Math.round((prev - current) / DAY_MS);
    if (diffDays <= 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function getAverageEnergy(checkins: CheckInRow[], rangeDays: number): number | null {
  const since = Date.now() - rangeDays * DAY_MS;
  const withEnergy = checkins.filter((row) => {
    const time = new Date(row.created_at).getTime();
    return time >= since && row.energy_level != null;
  });

  if (withEnergy.length === 0) return null;
  return Math.round(
    withEnergy.reduce((sum, row) => sum + (row.energy_level ?? 0), 0) / withEnergy.length
  );
}

export function getTopEmotion(checkins: CheckInRow[], rangeDays = 30): string | null {
  const since = Date.now() - rangeDays * DAY_MS;
  const counts = new Map<string, number>();

  for (const row of checkins) {
    if (new Date(row.created_at).getTime() < since) continue;
    for (const emotion of row.emotions ?? []) {
      counts.set(emotion, (counts.get(emotion) ?? 0) + 1);
    }
  }

  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return winner?.[0] ?? null;
}
