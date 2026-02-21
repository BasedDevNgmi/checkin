"use client";

import { useState } from "react";
import { EnergySummary } from "@/components/dashboard/EnergySummary";
import { Timeline } from "@/components/dashboard/Timeline";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FAB } from "@/components/FAB";
import { Card } from "@/components/ui/Card";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import { useMindJournal } from "@/features/app/useMindJournal";
import Link from "next/link";

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

  return (
    <div className="min-h-full pb-24">
      <header className="mb-8 sm:mb-10">
        <h1 suppressHydrationWarning className="text-[2rem] font-bold tracking-[-0.025em] text-[var(--text-primary)] sm:text-[2.25rem]">
          {getGreeting()}
        </h1>
        <p className="mt-2 text-[15px] text-[var(--text-muted)]">
          Je dagelijkse overzicht en check-ins
        </p>
        {preferences == null && (
          <div className="mt-5 border-l-2 border-[var(--accent)] pl-4 py-1">
            <p className="text-[13px] text-[var(--text-muted)]">
              Rond je profiel af voor herinneringen en persoonlijke instellingen.
            </p>
            <Link href="/onboarding" className="link-accent mt-1.5 inline-block text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 rounded">
              Naar onboarding →
            </Link>
          </div>
        )}
      </header>

      <section className="mb-10" aria-labelledby="today-heading">
        <h2 id="today-heading" className="sr-only">
          Status vandaag
        </h2>
        {hasTodayEntry ? (
          <Card variant="elevated" className="px-6 py-5 sm:px-7 sm:py-6">
            <p className="text-[15px] font-medium text-[var(--text-primary)]">
              Je bent klaar voor vandaag
            </p>
            <p className="mt-1 text-[13px] text-[var(--text-muted)] leading-relaxed">
              Bekijk je inzichten of blader door je entries.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/analytics"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Inzichten bekijken
              </Link>
              <Link
                href="/checkin"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-4 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Nog een check-in
              </Link>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" className="px-6 py-6 sm:px-7 sm:py-7">
            <p className="text-[17px] font-semibold text-[var(--text-primary)]">
              Nog geen check-in vandaag
            </p>
            <p className="mt-1.5 text-[13px] text-[var(--text-muted)] leading-relaxed">
              Beantwoord de 5 vragen en houd je ritme vast.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/checkin"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Nieuwe check-in
              </Link>
              <Link
                href="/analytics"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-4 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Inzichten
              </Link>
            </div>
          </Card>
        )}
      </section>

      {loading ? (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="h-6 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--interactive-hover)]" />
          </Card>
          <p className="text-[13px] text-[var(--text-soft)]">Laden…</p>
        </div>
      ) : (
        <>
          <EnergySummary checkins={rows} />

          <section className="mt-10" aria-labelledby="timeline-heading">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 id="timeline-heading" className="text-[17px] font-semibold text-[var(--text-primary)]">
                Tijdlijn
              </h2>
              <Link
                href="/analytics"
                className="link-accent text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 rounded"
              >
                Trends
              </Link>
            </div>
            {rows.length === 0 ? (
              <EmptyState />
            ) : (
              <Timeline checkins={rows} />
            )}
          </section>

          <FAB />
        </>
      )}
    </div>
  );
}
