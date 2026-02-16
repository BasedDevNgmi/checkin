"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getCheckIn } from "@/lib/checkin";
import { EntryDetailView } from "./EntryDetailView";
import type { CheckInRow } from "@/types/checkin";

interface EntryDetailClientProps {
  id: string;
}

export function EntryDetailClient({ id }: EntryDetailClientProps) {
  const [checkin, setCheckin] = useState<CheckInRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckIn(id).then((c) => {
      setCheckin(c ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="space-y-6 py-5 sm:py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
        </Link>
        <Card className="p-6">
          <p className="text-sm text-[var(--text-soft)]">Laden…</p>
        </Card>
      </div>
    );
  if (!checkin)
    return (
      <div className="space-y-6 py-5 sm:py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
        </Link>
        <Card className="p-6">
          <p className="mb-4 text-[var(--text-muted)]">Check-in niet gevonden.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[var(--accent-soft)] transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
          </Link>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6 py-5 sm:py-6">
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
