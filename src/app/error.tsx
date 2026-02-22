"use client";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-5 py-8 sm:px-6">
      <section className="glass-card w-full rounded-[var(--radius-card)] p-6">
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
          We konden deze pagina niet openen
        </h1>
        <p className="mt-2 text-[14px] text-[var(--text-muted)]">
          Er is een tijdelijke fout opgetreden.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-[14px] font-medium text-white transition-all duration-200 hover:brightness-[1.05]"
        >
          Opnieuw laden
        </button>
      </section>
    </main>
  );
}
