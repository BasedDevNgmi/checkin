"use client";

import { useCheckinsContext } from "@/lib/CheckinsContext";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export function AnalyticsScreen() {
  const { checkins, loading } = useCheckinsContext();

  if (loading) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-[var(--surface-glass-strong)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--surface-glass-strong)]" />
        </div>
        <p className="text-sm text-[var(--text-soft)]">Inzichten laden…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5 pb-24 sm:py-6">
      <AnalyticsView checkins={checkins} />
    </div>
  );
}
