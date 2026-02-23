"use client";

import dynamic from "next/dynamic";
import { saveCheckIn } from "@/lib/checkin";
import { ChevronLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";

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
  return (
    <div className="py-5 pb-8 sm:py-6 md:pb-10">
      <div className="mb-6 flex items-center">
        <LinkButton href="/dashboard" variant="secondary" className="-m-2 gap-1 px-2 py-2 text-[15px]">
          <ChevronLeft className="h-5 w-5" />
          Overzicht
        </LinkButton>
      </div>
      <CheckInWizard onSubmit={saveCheckIn} />
    </div>
  );
}
