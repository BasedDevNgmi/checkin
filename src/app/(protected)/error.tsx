"use client";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="glass-card rounded-[var(--radius-card)] p-6">
      <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
        Er ging iets mis
      </h1>
      <p className="mt-2 text-[14px] text-[var(--text-muted)]">
        De pagina kon niet goed geladen worden. Probeer opnieuw.
      </p>
      {error.message ? (
        <p className="mt-2 text-[13px] text-[var(--text-soft)]">{error.message}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-[14px] font-medium text-white transition-all duration-200 hover:brightness-[1.05]"
      >
        Opnieuw proberen
      </button>
    </section>
  );
}
