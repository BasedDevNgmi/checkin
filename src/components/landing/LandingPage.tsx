import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const FIVE_QUESTIONS = [
  { name: "Denken", tagline: "Wat gaat er door je hoofd?" },
  { name: "Emoties", tagline: "Welke emoties zijn er nu?" },
  { name: "Lijf", tagline: "Wat voel je in je lichaam?" },
  { name: "Energie", tagline: "Hoe staat je batterij?" },
  { name: "Gedrag", tagline: "Wat deed je net – bewust of automatisch?" },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 pt-[max(1rem,env(safe-area-inset-top,0px))]">
        <BrandLogo />
        <Link
          href="/login"
          className="rounded-xl py-2.5 px-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
        >
          Log in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <section className="w-full max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Check in met de 5 vragen
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
            Elke dag even stilstaan bij denken, gevoel en lijf.
          </p>
        </section>

        <section
          id="vragen"
          className="w-full max-w-2xl mx-auto mt-12 sm:mt-16"
          aria-labelledby="vragen-heading"
        >
          <h2 id="vragen-heading" className="sr-only">
            De 5 vragen
          </h2>
          <ul className="space-y-4 rounded-[var(--radius-card)] border border-[var(--surface-border)]/80 bg-[var(--surface-glass)]/80 py-5 px-5 sm:px-6 backdrop-blur-sm">
            {FIVE_QUESTIONS.map(({ name, tagline }, i) => (
              <li key={name} className="flex gap-4">
                <span className="text-xs font-semibold tabular-nums text-[var(--text-soft)] shrink-0 pt-0.5">
                  {i + 1}.
                </span>
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">{tagline}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-center text-xs text-[var(--text-soft)] max-w-md mx-auto">
          Jouw data blijft van jou – lokaal of veilig gesynchroniseerd.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-6 py-3.5 text-sm font-medium text-white shadow-[var(--shadow-zen)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
          >
            Start met inchecken
          </Link>
          <Link
            href="/#vragen"
            className="text-xs text-[var(--text-soft)] transition hover:text-[var(--text-muted)]"
          >
            Bekijk hoe het werkt
          </Link>
        </div>
      </main>
    </div>
  );
}
