"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function FAB() {
  return (
    <Link
      href="/checkin"
      className="fixed z-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] text-white shadow-[var(--shadow-zen)] transition hover:opacity-95 active:scale-95 md:h-14 md:w-14 md:rounded-2xl
        bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))]
        md:bottom-8 md:right-[max(2rem,env(safe-area-inset-right,0px))]"
      aria-label="Nieuwe check-in"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  );
}
