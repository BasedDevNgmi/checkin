"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function FAB() {
  return (
    <Link
      href="/checkin"
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-white/30 bg-[var(--accent)] text-white shadow-[var(--shadow-glass)] transition-all duration-200 hover:brightness-[1.04] hover:shadow-[var(--shadow-zen)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
        bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] right-[max(1.25rem,env(safe-area-inset-right,0px))]
        md:bottom-8 md:right-[max(2rem,env(safe-area-inset-right,0px))]"
      aria-label="Nieuwe check-in"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  );
}
