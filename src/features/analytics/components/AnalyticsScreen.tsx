"use client";

import dynamic from "next/dynamic";
import { useCheckinsContext } from "@/lib/CheckinsContext";

const AnalyticsView = dynamic(
  () => import("@/components/analytics/AnalyticsView").then((m) => m.AnalyticsView),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="glass-card rounded-[var(--radius-card)] p-6">
          <div className="h-6 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--interactive-hover)]" />
        </div>
        <p className="text-[13px] text-[var(--text-soft)]">Inzichten laden…</p>
      </div>
    ),
  }
);

export function AnalyticsScreen() {
  const { checkins, loading } = useCheckinsContext();

  if (loading) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <div className="glass-card rounded-[var(--radius-card)] p-6">
          <div className="h-6 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--interactive-hover)]" />
        </div>
        <p className="text-[13px] text-[var(--text-soft)]">Inzichten laden…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5 pb-24 sm:py-6">
      <AnalyticsView checkins={checkins} />
    </div>
  );
}
