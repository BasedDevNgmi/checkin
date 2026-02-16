"use client";

import { EnergySummary } from "@/components/dashboard/EnergySummary";
import { Timeline } from "@/components/dashboard/Timeline";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FAB } from "@/components/FAB";
import { useCheckins } from "@/lib/useCheckins";
import { useMindJournal } from "@/features/app/useMindJournal";
import Link from "next/link";

export function DashboardLocal() {
  const { checkins: rows, loading } = useCheckins();
  const { preferences } = useMindJournal();
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasTodayEntry = rows.some((row) => row.created_at.slice(0, 10) === todayKey);

  return (
    <div className="space-y-8 py-4">
      {preferences == null ? (
        <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-xl">
          <p className="text-sm text-[var(--text-muted)]">
            Rond je profiel af voor herinneringen en persoonlijke instellingen.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 inline-block text-sm font-medium text-[var(--text-primary)] underline decoration-[var(--text-soft)] underline-offset-2 transition hover:decoration-[var(--text-primary)]"
          >
            Naar onboarding
          </Link>
        </section>
      ) : null}
      {hasTodayEntry ? (
        <div className="flex flex-wrap items-center justify-between gap-2 py-2">
          <p className="text-sm text-[var(--text-muted)]">
            Je bent klaar voor vandaag – geen check-in meer nodig.
          </p>
          <Link
            href="/analytics"
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            Bekijk inzichten
          </Link>
        </div>
      ) : (
        <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Jouw check-ins</h1>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                De 5 vragen. Nog geen check-in vandaag.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/checkin"
                className="rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-zen)] transition hover:opacity-95"
              >
                Nieuwe check-in
              </Link>
              <Link
                href="/analytics"
                className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              >
                Bekijk inzichten
              </Link>
            </div>
          </div>
        </section>
      )}
      {loading ? (
        <p className="text-sm text-[var(--text-soft)]">Laden…</p>
      ) : (
        <>
          <EnergySummary checkins={rows} />
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Overzicht</h2>
                <Link
                  href="/analytics"
                  className="text-xs font-medium text-[var(--text-soft)] transition hover:text-[var(--text-muted)]"
                >
                  Trends bekijken
                </Link>
              </div>
              <Timeline checkins={rows} />
            </section>
          )}
          <FAB />
        </>
      )}
    </div>
  );
}
