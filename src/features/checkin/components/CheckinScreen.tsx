"use client";

import Link from "next/link";
import { CheckInWizard } from "@/components/checkin/CheckInWizard";
import { saveCheckIn } from "@/lib/checkin";

export function CheckinScreen() {
  return (
    <div className="space-y-4 py-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Check-in</h1>
        <Link
          href="/dashboard"
          className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-xs"
        >
          Terug naar overzicht
        </Link>
      </div>
      <CheckInWizard onSubmit={saveCheckIn} />
    </div>
  );
}
