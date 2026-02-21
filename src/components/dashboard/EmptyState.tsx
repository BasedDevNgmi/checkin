"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-[17px] font-medium text-[var(--text-primary)]">
        Nog geen check-ins
      </p>
      <p className="mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed">
        Start met een check-in en bouw je overzicht rustig op.
      </p>
      <Link
        href="/checkin"
        className="mt-8 inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        Eerste check-in
      </Link>
    </div>
  );
}
