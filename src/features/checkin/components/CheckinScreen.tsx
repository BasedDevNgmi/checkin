"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { saveCheckIn } from "@/lib/checkin";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import { ChevronLeft } from "lucide-react";

const CheckInWizard = dynamic(
  () => import("@/components/checkin/CheckInWizard").then((m) => m.CheckInWizard),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-[var(--radius-control)] bg-[var(--interactive-hover)]" />
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--interactive-hover)]" />
      </div>
    ),
  }
);

export function CheckinScreen() {
  const { refresh } = useCheckinsContext();

  return (
    <div className="py-5 pb-8 sm:py-6 md:pb-10">
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard"
          className="link-muted -m-2 flex min-h-[44px] items-center gap-1 rounded-[var(--radius-control)] bg-[var(--surface-elevated)] px-2 py-2 text-[15px] font-medium shadow-[var(--shadow-elevation)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label="Terug naar overzicht"
        >
          <ChevronLeft className="h-5 w-5" />
          Overzicht
        </Link>
      </div>
      <CheckInWizard onSubmit={saveCheckIn} onSuccess={refresh} />
    </div>
  );
}
