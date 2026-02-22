"use client";

import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export function EmptyState() {
  return (
    <section className="glass-card rounded-[var(--radius-card)] p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-elevated)]">
        <BookOpenCheck className="h-5 w-5 text-[var(--text-primary)]" aria-hidden />
      </div>
      <p className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
        Welkom, dit is jouw rustige plek.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
        Je eerste check-in is de eerste stap. Kort en eerlijk is genoeg.
      </p>
      <Link
        href="/checkin"
        className="mt-7 inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-[var(--shadow-elevation)] transition-colors duration-200 hover:brightness-[1.04] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        Start je eerste check-in
      </Link>
    </section>
  );
}
