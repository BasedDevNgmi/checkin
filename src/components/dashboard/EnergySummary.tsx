"use client";

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
  const avg = getAverageEnergy(checkins, 7);
  const uniqueDays = getUniqueCheckinDays(checkins);
  const streak = getCurrentStreak(checkins);
  const topEmotion = getTopEmotion(checkins, 30);

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
        const className =
          "rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-xl transition " +
          (href
            ? "hover:bg-[var(--interactive-hover)] active:bg-[var(--interactive-active)] min-h-[88px] flex flex-col justify-center"
            : "min-h-[88px] flex flex-col justify-center");

        if (href) {
          return (
            <Link key={label} href={href} className={className}>
              {content}
            </Link>
          );
        }
        return (
          <div key={label} className={className}>
            {content}
          </div>
        );
      })}
    </section>
  );
}
