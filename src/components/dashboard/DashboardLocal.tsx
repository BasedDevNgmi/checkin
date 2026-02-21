"use client";

import { useMemo, useState } from "react";
import { Timeline } from "@/components/dashboard/Timeline";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FAB } from "@/components/FAB";
import { Card } from "@/components/ui/Card";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import { useMindJournal } from "@/features/app/useMindJournal";
import {
  getAverageEnergy,
  getCurrentStreak,
  getTopEmotion,
} from "@/lib/checkin-insights";
import Link from "next/link";
import { Flame } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

export function DashboardLocal() {
  const { checkins: rows, loading } = useCheckinsContext();
  const { preferences } = useMindJournal();
  const [todayKey] = useState(() => new Date().toISOString().slice(0, 10));
  const hasTodayEntry = rows.some((row) => row.created_at.slice(0, 10) === todayKey);

  const streak = useMemo(() => getCurrentStreak(rows), [rows]);
  const avgEnergy = useMemo(() => getAverageEnergy(rows, 7), [rows]);
  const topEmotion = useMemo(() => getTopEmotion(rows, 30), [rows]);

  const stats = [
    streak > 0 && { label: `${streak} ${streak === 1 ? "dag" : "dagen"}`, icon: true },
    avgEnergy != null && { label: `${avgEnergy}% energie`, icon: false },
    topEmotion && { label: topEmotion, icon: false },
  ].filter(Boolean) as { label: string; icon: boolean }[];

  return (
    <div className="min-h-full pb-24">
      <header className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 suppressHydrationWarning className="text-[1.5rem] font-bold tracking-[-0.025em] text-[var(--text-primary)] sm:text-[1.75rem]">
            {getGreeting()}
          </h1>
          {stats.length > 0 && (
            <div className="flex items-center gap-3 text-[13px] text-[var(--text-muted)]">
              {stats.map((stat, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {stat.icon && <Flame className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />}
                  {stat.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {!hasTodayEntry && rows.length > 0 && (
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            Nog geen check-in vandaag.{" "}
            <Link href="/checkin" className="link-accent font-medium">
              Start er een
            </Link>
          </p>
        )}

        {preferences == null && (
          <div className="mt-3 border-l-2 border-[var(--accent)] pl-4 py-1">
            <p className="text-[13px] text-[var(--text-muted)]">
              Rond je profiel af voor herinneringen.{" "}
              <Link href="/onboarding" className="link-accent font-medium">
                Naar onboarding →
              </Link>
            </p>
          </div>
        )}
      </header>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
          <div className="h-24 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section aria-labelledby="timeline-heading">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="timeline-heading" className="text-[15px] font-semibold text-[var(--text-primary)]">
                Tijdlijn
              </h2>
              <Link
                href="/analytics"
                className="link-accent text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 rounded"
              >
                Trends
              </Link>
            </div>
            <Timeline checkins={rows} />
          </section>

          <FAB />
        </>
      )}
    </div>
  );
}
