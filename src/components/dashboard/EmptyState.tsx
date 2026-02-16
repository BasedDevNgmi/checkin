import Link from "next/link";

export function EmptyState() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-8 text-center shadow-[var(--shadow-zen)] backdrop-blur-xl">
      <p className="text-[var(--text-primary)]">Nog geen check-ins vandaag.</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Begin met een check-in en bouw je overzicht rustig op.
      </p>
      <Link
        href="/checkin"
        className="mt-6 inline-flex rounded-[14px] bg-gradient-to-b from-[#6f63ff] to-[#5a4fff] px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-zen)] transition hover:from-[#6659ff] hover:to-[#5248ff]"
      >
        Beantwoord de 5 vragen
      </Link>
    </div>
  );
}
