"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] px-5 py-10 text-center shadow-[var(--shadow-zen)] backdrop-blur-xl">
      <p className="text-[17px] font-semibold text-[var(--text-primary)]">
        Nog geen check-ins
      </p>
      <p className="mt-2 text-[15px] text-[var(--text-muted)]">
        Start met een check-in en bouw je overzicht rustig op.
      </p>
      <Link
        href="/checkin"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:opacity-92 active:opacity-90"
      >
        Eerste check-in
      </Link>
    </div>
  );
}
