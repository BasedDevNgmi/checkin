"use client";

import Link from "next/link";
import { CheckInWizard } from "@/components/checkin/CheckInWizard";
import { saveCheckIn } from "@/lib/checkin";
import { useCheckinsContext } from "@/lib/CheckinsContext";
import { ChevronLeft } from "lucide-react";

export function CheckinScreen() {
  const { refresh } = useCheckinsContext();

  return (
    <div className="py-5 pb-24 sm:py-6">
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard"
          className="-m-2 flex min-h-[44px] items-center gap-1 rounded-[12px] px-2 py-2 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
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
