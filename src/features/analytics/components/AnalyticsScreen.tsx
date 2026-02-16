"use client";

import { useCheckins } from "@/lib/useCheckins";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export function AnalyticsScreen() {
  const { checkins, loading } = useCheckins();

  if (loading) {
    return <p className="py-4 text-sm text-[var(--text-soft)]">Laden…</p>;
  }

  return (
    <div className="space-y-8 py-4 pb-24">
      <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Jouw check-in inzichten
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Ritme, energie en patronen.
        </p>
      </section>
      <AnalyticsView checkins={checkins} />
    </div>
  );
}
