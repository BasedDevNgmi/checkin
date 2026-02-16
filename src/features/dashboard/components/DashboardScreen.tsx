"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMindJournal } from "@/features/app/useMindJournal";
import { MoodCheckInForm } from "@/features/mood/components/MoodCheckInForm";
import { JournalEntryForm } from "@/features/journal/components/JournalEntryForm";
import { JournalTimeline } from "@/features/journal/components/JournalTimeline";
import { formatDay } from "@/core/lib/date";

export function DashboardScreen() {
  const {
    moodCheckIns,
    journalEntries,
    preferences,
    saveMood,
    saveJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
  } = useMindJournal();

  const hasCheckInToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return moodCheckIns.some((item) => item.createdAt.slice(0, 10) === today);
  }, [moodCheckIns]);

  return (
    <div className="space-y-5 py-4 pb-24">
      <section className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-zen">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
          {preferences?.name ? `Welcome back, ${preferences.name}` : "Welcome"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Mind Journal</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {hasCheckInToday
            ? "You already checked in today. Add a deeper journal note below."
            : "Capture your state in under a minute and keep momentum."}
        </p>
        {!preferences ? (
          <p className="mt-2 text-xs text-[var(--text-soft)]">
            Finish profile setup in{" "}
            <Link href="/onboarding" className="underline">
              onboarding
            </Link>{" "}
            for reminders and personalization.
          </p>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Link
            href="/analytics"
            className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          >
            View insights
          </Link>
          <Link
            href="/profile"
            className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
          >
            Settings
          </Link>
        </div>
      </section>

      <MoodCheckInForm onCreate={saveMood} />
      <JournalEntryForm moods={moodCheckIns} onCreate={saveJournalEntry} />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Timeline</h2>
          {moodCheckIns[0] ? (
            <p className="text-xs text-[var(--text-soft)]">Last check-in: {formatDay(moodCheckIns[0].createdAt)}</p>
          ) : null}
        </div>
        <JournalTimeline
          entries={journalEntries}
          moods={moodCheckIns}
          onDelete={removeJournalEntry}
          onEdit={updateJournalEntry}
        />
      </section>
    </div>
  );
}
