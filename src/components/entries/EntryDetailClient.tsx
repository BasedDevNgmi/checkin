"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCheckInByIdLocal } from "@/lib/checkin-local";
import { EntryDetailView } from "./EntryDetailView";
import type { CheckInRow } from "@/types/checkin";

interface EntryDetailClientProps {
  id: string;
}

export function EntryDetailClient({ id }: EntryDetailClientProps) {
  const [checkin, setCheckin] = useState<CheckInRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckInByIdLocal(id).then((c) => {
      setCheckin(c ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="py-4 text-sm text-[var(--text-soft)]">Laden…</p>;
  if (!checkin)
    return (
      <div className="py-4">
        <p className="mb-4 text-[var(--text-muted)]">Check-in niet gevonden.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[#8ea0ff] transition hover:text-[#b1bdff]"
        >
          <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
        </Link>
      </div>
    );

  return (
    <div className="space-y-6 py-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
      </Link>
      <EntryDetailView checkin={checkin} />
    </div>
  );
}
