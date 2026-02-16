"use client";

import { buildInsightSummary } from "@/core/lib/insights";
import type { JournalEntry, MoodCheckIn } from "@/core/storage/models";

interface InsightsDashboardProps {
  moods: MoodCheckIn[];
  entries: JournalEntry[];
}

export function InsightsDashboard({ moods, entries }: InsightsDashboardProps) {
  const summary = buildInsightSummary(moods, entries);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <p className="text-xs text-[var(--text-soft)]">Current streak</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{summary.currentStreak} days</p>
        </article>
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <p className="text-xs text-[var(--text-soft)]">Average mood</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            {summary.averageValence ?? "-"}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <p className="text-xs text-[var(--text-soft)]">Average energy</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            {summary.averageEnergy ?? "-"}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <p className="text-xs text-[var(--text-soft)]">Journal entries</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{summary.journalCount}</p>
        </article>
      </div>

      <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Calendar heatmap</h2>
        <div className="grid grid-cols-7 gap-1">
          {summary.dailyHeatmap.slice(-84).map((day) => (
            <div
              key={day.day}
              className="h-7 rounded-md"
              style={{ opacity: Math.max(0.25, day.score / 10), background: "rgb(91 79 255)" }}
              title={`${day.day}: mood ${day.score}, ${day.count} check-ins`}
            />
          ))}
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tags linked to low mood</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {summary.topLowMoodTags.length ? summary.topLowMoodTags.join(", ") : "Not enough data yet."}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tags linked to high mood</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {summary.topHighMoodTags.length ? summary.topHighMoodTags.join(", ") : "Not enough data yet."}
          </p>
        </article>
      </div>
    </section>
  );
}
