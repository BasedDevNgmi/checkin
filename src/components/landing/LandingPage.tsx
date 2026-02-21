"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_SMOOTH } from "@/lib/motion";
import { BrandLogo } from "@/components/BrandLogo";

const FIVE_QUESTIONS = [
  { name: "Denken", tagline: "Wat gaat er door je hoofd?" },
  { name: "Emoties", tagline: "Welke emoties zijn er nu?" },
  { name: "Lijf", tagline: "Wat voel je in je lichaam?" },
  { name: "Energie", tagline: "Hoe staat je batterij?" },
  { name: "Gedrag", tagline: "Wat deed je net – bewust of automatisch?" },
] as const;

export function LandingPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--background)] px-5 sm:px-8 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-3 sm:pb-4">
        <BrandLogo />
        <Link
          href="/login"
          className="rounded-[var(--radius-control)] min-h-[44px] inline-flex items-center px-3.5 py-2 text-[15px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Log in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SMOOTH }}
          className="w-full max-w-xl mx-auto text-center"
        >
          <h1 className="text-[2.75rem] leading-[1.1] font-bold tracking-[-0.025em] text-[var(--text-primary)] sm:text-5xl">
            Check in met<br />de 5 vragen
          </h1>
          <p className="mt-5 text-[17px] text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
            Elke dag even stilstaan bij denken, gevoel en lijf.
          </p>
        </motion.section>

        <section
          id="vragen"
          className="w-full max-w-md mx-auto mt-16 sm:mt-20"
          aria-labelledby="vragen-heading"
        >
          <h2 id="vragen-heading" className="sr-only">
            De 5 vragen
          </h2>
          <ul className="space-y-8">
            {FIVE_QUESTIONS.map(({ name, tagline }, i) => (
              <motion.li
                key={name}
                className="flex gap-5"
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.15 + i * 0.06,
                  ease: EASE_SMOOTH,
                }}
              >
                <span className="text-[13px] font-medium tabular-nums text-[var(--text-soft)] shrink-0 pt-0.5 w-5 text-right">
                  {i + 1}
                </span>
                <div>
                  <span className="text-[15px] font-medium text-[var(--text-primary)]">{name}</span>
                  <p className="mt-1 text-[13px] text-[var(--text-muted)] leading-relaxed">{tagline}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>

        <p className="mt-16 text-center text-xs text-[var(--text-soft)] max-w-xs mx-auto leading-relaxed">
          Jouw data blijft van jou — lokaal of veilig gesynchroniseerd.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-7 py-3.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[var(--accent-soft)] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] min-h-[44px]"
          >
            Start met inchecken
          </Link>
          <Link
            href="/#vragen"
            className="link-muted text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
          >
            Bekijk hoe het werkt
          </Link>
        </div>
      </main>
    </div>
  );
}
