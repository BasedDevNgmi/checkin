"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckInWizard } from "@/components/checkin/CheckInWizard";
import { getCheckIn, updateCheckIn } from "@/lib/checkin";
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
    getCheckIn(id).then((row) => {
      if (row) setInitialData(rowToFormState(row));
      else setNotFound(true);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <p className="text-sm text-[var(--text-soft)]">Laden…</p>
      </div>
    );
  }

  if (notFound || !initialData) {
    return (
      <div className="space-y-6 py-5 pb-24 sm:py-6">
        <p className="text-[var(--text-muted)]">Check-in niet gevonden.</p>
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-[var(--accent-soft)] transition hover:opacity-80"
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
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Check-in bewerken
        </h1>
        <Link
          href={`/entries/${id}`}
          className="rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2.5 text-sm min-h-[44px]"
        >
          Annuleren
        </Link>
      </div>
      <CheckInWizard
        onSubmit={handleSubmit}
        initialData={initialData}
        successRedirect={`/entries/${id}`}
      />
    </div>
  );
}
