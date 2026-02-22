"use client";

import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { useCheckinsContext } from "@/lib/CheckinsContext";

export function AnalyticsScreen() {
  const { checkins, loading } = useCheckinsContext();

  if (loading) {
    return (
      <div className="space-y-6 py-6 pb-28 sm:py-8 md:pb-10">
        <div className="glass-card rounded-[var(--radius-card)] p-6">
          <div className="h-6 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--interactive-hover)]" />
        </div>
        <p className="text-[13px] text-[var(--text-soft)]">Inzichten laden…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 pb-28 sm:py-8 md:pb-10">
      <AnalyticsView checkins={checkins} />
    </div>
  );
}
