"use client";

import { useMemo, useState } from "react";
import { Timeline } from "@/components/dashboard/Timeline";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FAB } from "@/components/FAB";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import { useMindJournal } from "@/features/app/useMindJournal";
import {
  getAverageEnergy,
  getCurrentStreak,
  getTopEmotion,
} from "@/lib/checkin-insights";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

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
  const todayEntry = rows.find((row) => row.created_at.slice(0, 10) === todayKey);
  const hasTodayEntry = todayEntry != null;

  const streak = useMemo(() => getCurrentStreak(rows), [rows]);
  const avgEnergy = useMemo(() => getAverageEnergy(rows, 7), [rows]);
  const topEmotion = useMemo(() => getTopEmotion(rows, 30), [rows]);

  const stats = [
    streak > 0 && { label: `${streak} ${streak === 1 ? "dag" : "dagen"}`, icon: true },
    avgEnergy != null && { label: `${avgEnergy}% energie`, icon: false },
    topEmotion && { label: topEmotion, icon: false },
  ].filter(Boolean) as { label: string; icon: boolean }[];

  return (
    <div className="dashboard-calm-shell min-h-full pb-24">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)]/70 bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-soft)]">
                  Vandaag
                </p>
                <h1
                  suppressHydrationWarning
                  className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-[1.62rem]"
                >
                  {hasTodayEntry ? `${getGreeting()}, je bent op koers` : `${getGreeting()}, hoe gaat het vandaag?`}
                </h1>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {hasTodayEntry
                    ? "Mooi dat je al hebt ingecheckt. Pak je moment en kijk wat opvalt."
                    : "Een korte check-in geeft rust en overzicht. Begin klein, je hoeft het niet perfect te doen."}
                </p>
              </div>

              {hasTodayEntry ? (
                <Link
                  href={`/entries/${todayEntry.id}`}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--surface-border)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                >
                  Bekijk vandaag <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <Link
                  href="/checkin"
                  className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                >
                  Start check-in
                </Link>
              )}
            </div>

            {stats.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px]">
                {stats.map((stat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] px-3 py-1 text-[var(--text-muted)]"
                  >
                    {stat.icon && <Flame className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />}
                    {stat.label}
                  </span>
                ))}
                <Link
                  href="/analytics"
                  className="inline-flex items-center rounded-full border border-[var(--surface-border)] px-3 py-1 font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
                >
                  Bekijk trends
                </Link>
              </div>
            )}
          </div>

          {preferences == null && (
            <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)]/90 px-4 py-2.5">
              <p className="text-[13px] text-[var(--text-muted)]">
                Rond je profiel af voor herinneringen.{" "}
                <Link href="/onboarding" className="link-accent font-medium">
                  Naar onboarding
                </Link>
              </p>
            </div>
          )}
        </header>

        {loading ? (
          <div className="space-y-4">
            <div className="h-36 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
            <div className="h-12 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
            <div className="h-24 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section aria-labelledby="timeline-heading">
              <div className="mb-4">
                <h2 id="timeline-heading" className="text-[15px] font-semibold text-[var(--text-primary)]">
                  Tijdlijn
                </h2>
                <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                  Je recente check-ins, gedachten en patronen.
                </p>
              </div>
              <Timeline checkins={rows} />
            </section>

            <FAB />
          </>
        )}
      </div>
    </div>
  );
}
