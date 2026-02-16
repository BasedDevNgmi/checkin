"use client";

import { EnergySummary } from "@/components/dashboard/EnergySummary";
import { Timeline } from "@/components/dashboard/Timeline";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FAB } from "@/components/FAB";
import { useCheckins } from "@/lib/useCheckins";
import { useMindJournal } from "@/features/app/useMindJournal";
import Link from "next/link";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

export function DashboardLocal() {
  const { checkins: rows, loading } = useCheckins();
  const { preferences } = useMindJournal();
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasTodayEntry = rows.some((row) => row.created_at.slice(0, 10) === todayKey);

  return (
    <div className="min-h-full pb-24">
      {/* Page title + optional onboarding */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--text-muted)]">
          Je dagelijkse overzicht en check-ins
        </p>
        {preferences == null && (
          <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-xl">
            <p className="text-sm text-[var(--text-muted)]">
              Rond je profiel af voor herinneringen en persoonlijke instellingen.
            </p>
            <Link
              href="/onboarding"
              className="mt-2 inline-block text-sm font-medium text-[var(--accent)] transition hover:underline"
            >
              Naar onboarding →
            </Link>
          </div>
        )}
      </header>

      {/* Today status: done vs start check-in */}
      <section className="mb-8">
        {hasTodayEntry ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-5 py-4 shadow-[var(--shadow-zen)] backdrop-blur-xl">
            <p className="text-[15px] font-medium text-[var(--text-primary)]">
              Je bent klaar voor vandaag
            </p>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Geen check-in meer nodig. Bekijk je inzichten of blader door je entries.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/analytics"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:opacity-92 active:opacity-90"
              >
                Inzichten bekijken
              </Link>
              <Link
                href="/checkin"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-4 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Nog een check-in
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-5 py-5 shadow-[var(--shadow-zen)] backdrop-blur-xl">
            <p className="text-[17px] font-semibold text-[var(--text-primary)]">
              Nog geen check-in vandaag
            </p>
            <p className="mt-1 text-[15px] text-[var(--text-muted)]">
              Beantwoord de 5 vragen en houd je ritme vast.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/checkin"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:opacity-92 active:opacity-90"
              >
                Nieuwe check-in
              </Link>
              <Link
                href="/analytics"
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-4 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              >
                Inzichten
              </Link>
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-5 py-8 text-center backdrop-blur-xl">
          <p className="text-[15px] text-[var(--text-muted)]">Laden…</p>
        </div>
      ) : (
        <>
          <EnergySummary checkins={rows} />

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">Overzicht</h2>
              <Link
                href="/analytics"
                className="text-[13px] font-medium text-[var(--text-muted)] transition hover:text-[var(--accent)]"
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
