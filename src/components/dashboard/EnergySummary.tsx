"use client";

import Link from "next/link";
import type { CheckInRow } from "@/types/checkin";
import {
  getAverageEnergy,
  getCurrentStreak,
  getTopEmotion,
  getUniqueCheckinDays,
} from "@/lib/checkin-insights";

interface EnergySummaryProps {
  checkins: CheckInRow[];
}

export function EnergySummary({ checkins }: EnergySummaryProps) {
  const avg = getAverageEnergy(checkins, 7);
  const uniqueDays = getUniqueCheckinDays(checkins);
  const streak = getCurrentStreak(checkins);
  const topEmotion = getTopEmotion(checkins, 30);

  return (
    <section className="grid gap-4 sm:grid-cols-4">
      <Link
        href="/analytics"
        className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-lg transition hover:bg-[var(--interactive-hover)]"
      >
        <p className="text-xs text-[var(--text-soft)]">Huidige ritme</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{streak} dagen</p>
        <p className="mt-1 text-xs text-[var(--text-soft)]">Bekijk patroon in analytics</p>
      </Link>
      <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-lg">
        <p className="text-xs text-[var(--text-soft)]">Gem. energie (7 dagen)</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
          {avg == null ? "—" : `${avg}%`}
        </p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-lg">
        <p className="text-xs text-[var(--text-soft)]">Dagen ingecheckt</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{uniqueDays}</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-lg">
        <p className="text-xs text-[var(--text-soft)]">Vaakst gevoeld (30 dagen)</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
          {topEmotion ?? "—"}
        </p>
      </div>
    </section>
  );
}
