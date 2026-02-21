"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { CheckInRow } from "@/types/checkin";
import {
  getAverageEnergy,
  getCurrentStreak,
  getTopEmotion,
  getUniqueCheckinDays,
} from "@/lib/checkin-insights";

interface EnergySummaryProps {
  checkins: CheckInRow[];
}

export function EnergySummary({ checkins }: EnergySummaryProps) {
  const avg = useMemo(() => getAverageEnergy(checkins, 7), [checkins]);
  const uniqueDays = useMemo(() => getUniqueCheckinDays(checkins), [checkins]);
  const streak = useMemo(() => getCurrentStreak(checkins), [checkins]);
  const topEmotion = useMemo(() => getTopEmotion(checkins, 30), [checkins]);

  const cards = [
    {
      label: "Ritme",
      value: streak,
      suffix: "dagen",
      href: "/analytics",
    },
    {
      label: "Gem. energie",
      value: avg == null ? "—" : avg,
      suffix: avg != null ? "%" : "",
      href: null,
    },
    {
      label: "Dagen ingecheckt",
      value: uniqueDays,
      suffix: "",
      href: null,
    },
    {
      label: "Vaakst gevoeld",
      value: topEmotion ?? "—",
      suffix: "",
      href: null,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, suffix, href }) => {
        const content = (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-soft)]">
              {label}
            </p>
            <p className="mt-1.5 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
              {value}
              {suffix}
            </p>
          </>
        );
        const cls =
          "rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-elevation)] transition-colors duration-200 min-h-[88px] flex flex-col justify-center" +
          (href
            ? " hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)]"
            : "");

        if (href) {
          return (
            <Link
              key={label}
              href={href}
              className={`${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]`}
            >
              {content}
            </Link>
          );
        }
        return (
          <div key={label} className={cls}>
            {content}
          </div>
        );
      })}
    </section>
  );
}
