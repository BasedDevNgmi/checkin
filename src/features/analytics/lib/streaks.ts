import type { CheckInRow } from "@/types/checkin";
import { startOfDay, toDayKey } from "@/features/analytics/lib/date";

export function computeStreaks(checkins: CheckInRow[], referenceDate: Date): { current: number; longest: number } {
  const daysWithCheckIn = new Set(checkins.map((c) => toDayKey(new Date(c.created_at))));
  const sortedDays = Array.from(daysWithCheckIn).sort();
  if (sortedDays.length === 0) return { current: 0, longest: 0 };

  const today = toDayKey(startOfDay(referenceDate));
  let current = 0;
  const d = new Date(today);
  for (;;) {
    if (!daysWithCheckIn.has(toDayKey(d))) break;
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
