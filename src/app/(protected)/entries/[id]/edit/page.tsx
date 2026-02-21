"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckInWizard } from "@/components/checkin/CheckInWizard";
import { getCheckIn, updateCheckIn } from "@/lib/checkin";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import type { CheckInFormState, CheckInRow } from "@/types/checkin";

function rowToFormState(row: CheckInRow): CheckInFormState {
  return {
    thoughts: row.thoughts ?? "",
    emotions: row.emotions ?? [],
    bodyParts: row.body_parts ?? [],
    energyLevel: row.energy_level ?? 50,
    behaviorMeta: row.behavior_meta ?? {},
  };
}

export default function EditEntryPage() {
  const params = useParams();
  const { refresh } = useCheckinsContext();
  const id = typeof params.id === "string" ? params.id : "";
  const [initialData, setInitialData] = useState<CheckInFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    getCheckIn(id)
      .then((row) => {
        if (row) setInitialData(rowToFormState(row));
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-elevation)]">
          <div className="h-6 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--interactive-hover)]" />
        </div>
        <p className="text-[13px] text-[var(--text-soft)]">Laden…</p>
      </div>
    );
  }

  if (notFound || !initialData) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <p className="text-[var(--text-muted)]">Check-in niet gevonden.</p>
        <Link
          href="/dashboard"
          className="inline-flex text-[13px] text-[var(--accent)] transition hover:opacity-80"
        >
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  async function handleSubmit(data: CheckInFormState) {
    return updateCheckIn(id, data);
  }

  return (
    <div className="space-y-6 py-5 pb-24 sm:py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
          Check-in bewerken
        </h1>
        <Link
          href={`/entries/${id}`}
          className="link-muted inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] border border-[var(--surface-border)] px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Annuleren
        </Link>
      </div>
      <CheckInWizard
        onSubmit={handleSubmit}
        initialData={initialData}
        successRedirect={`/entries/${id}`}
        onSuccess={refresh}
      />
    </div>
  );
}
