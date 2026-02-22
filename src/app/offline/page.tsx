"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Je bent offline</h1>
      <p className="text-sm text-[var(--text-muted)]">
        Er is geen internetverbinding. Je kunt deze pagina opnieuw laden zodra je weer online bent.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] bg-[var(--interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--interactive-primary-text)]"
        >
          Opnieuw laden
        </button>
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] border border-[var(--surface-border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
        >
          Naar dashboard
        </Link>
      </div>
    </main>
  );
}
