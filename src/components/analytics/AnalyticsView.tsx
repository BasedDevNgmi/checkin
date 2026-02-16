"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CheckInRow } from "@/types/checkin";
import { EnergyChart } from "@/components/dashboard/EnergyChart";

interface AnalyticsViewProps {
  checkins: CheckInRow[];
}

const periods = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getEnergyTone(value: number | null) {
  if (value == null) return "bg-[var(--interactive-hover)]";
  if (value >= 75) return "bg-[#5a4fff]";
  if (value >= 50) return "bg-[#827cff]";
  if (value >= 25) return "bg-[#b0adff]";
  return "bg-[#d7d5ff]";
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function AnalyticsView({ checkins }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]["value"]>(30);
  const reduceMotion = useReducedMotion();
  const now = new Date();
  const start = startOfDay(new Date(now.getTime() - (period - 1) * 24 * 60 * 60 * 1000));

  const aggregate = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number; checkins: number }>();
    for (const row of checkins) {
      const date = new Date(row.created_at);
      const bucketKey = dayKey(date);
      const current = byDay.get(bucketKey) ?? { sum: 0, count: 0, checkins: 0 };
      current.checkins += 1;
      if (row.energy_level != null) {
        current.sum += row.energy_level;
        current.count += 1;
      }
      byDay.set(bucketKey, current);
    }
    return byDay;
  }, [checkins]);

  const chartData = useMemo(() => {
    return Array.from({ length: period }, (_, index) => {
      const d = new Date(start);
      d.setDate(start.getDate() + index);
      const key = dayKey(d);
      const bucket = aggregate.get(key);
      const avg = bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null;
      return {
        date: key,
        label: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
        value: avg,
      };
    });
  }, [aggregate, period, start]);

  const heatmapCells = chartData.map((point) => ({
    ...point,
    entries: aggregate.get(point.date)?.checkins ?? 0,
  }));

  const completedDays = heatmapCells.filter((d) => d.entries > 0).length;
  const avgEnergy =
    chartData.filter((d) => d.value != null).length > 0
      ? Math.round(
          chartData
            .filter((d) => d.value != null)
            .reduce((sum, d) => sum + (d.value ?? 0), 0) /
            chartData.filter((d) => d.value != null).length
        )
      : null;
  const bestDay = chartData
    .filter((d) => d.value != null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  const lowDay = chartData
    .filter((d) => d.value != null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];

  const emotionInsights = useMemo(() => {
    const byEmotion = new Map<string, { total: number; count: number }>();
    for (const row of checkins) {
      if (row.energy_level == null) continue;
      for (const emotion of row.emotions ?? []) {
        const current = byEmotion.get(emotion) ?? { total: 0, count: 0 };
        current.total += row.energy_level;
        current.count += 1;
        byEmotion.set(emotion, current);
      }
    }
    return [...byEmotion.entries()]
      .map(([emotion, values]) => ({
        emotion,
        avg: Math.round(values.total / values.count),
        count: values.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [checkins]);

  const weekdayInsight = useMemo(() => {
    const weekdays = new Map<string, { total: number; count: number }>();
    for (const row of checkins) {
      if (row.energy_level == null) continue;
      const weekday = new Date(row.created_at).toLocaleDateString("nl-NL", {
        weekday: "long",
      });
      const current = weekdays.get(weekday) ?? { total: 0, count: 0 };
      current.total += row.energy_level;
      current.count += 1;
      weekdays.set(weekday, current);
    }
    return [...weekdays.entries()]
      .map(([day, values]) => ({ day, avg: Math.round(values.total / values.count) }))
      .sort((a, b) => b.avg - a.avg)[0];
  }, [checkins]);

  return (
    <div className="space-y-8 pb-24">
      <section className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Jouw stemming door de tijd
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Zie je ritme per dag en ontdek patronen in energie en check-in consistentie.
        </p>
        <div className="mt-4 inline-flex rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-1">
          {periods.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-[14px] px-3 py-1.5 text-sm font-medium transition ${
                option.value === period
                  ? "bg-[var(--interactive-active)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
              }`}
              aria-pressed={option.value === period}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <EnergyChart
        data={chartData}
        title={`Energie trend (${period} dagen)`}
        subtitle="Dagelijks gemiddelde op basis van je check-ins"
      />

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={reduceMotion ? {} : { duration: 0.45, ease: "easeOut" }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-zen)] backdrop-blur-xl lg:col-span-2">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Kalender heatmap</h2>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Donkerder = hogere energie, lichter = lagere energie.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {heatmapCells.map((cell) => (
              <div key={cell.date} className="space-y-1 text-center">
                <div
                  className={`h-9 rounded-xl border border-white/40 ${getEnergyTone(cell.value)}`}
                  title={`${cell.label}: ${cell.value ?? "geen score"}${
                    cell.entries > 0 ? `, ${cell.entries} check-in(s)` : ""
                  }`}
                />
                <p className="text-[10px] text-[var(--text-soft)]">
                  {new Date(cell.date).toLocaleDateString("nl-NL", {
                    weekday: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-xl">
            <p className="text-xs text-[var(--text-soft)]">Gemiddelde energie</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
              {avgEnergy == null ? "—" : `${avgEnergy}%`}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-xl">
            <p className="text-xs text-[var(--text-soft)]">Dagen met check-in</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
              {completedDays} / {period}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4 shadow-[var(--shadow-zen)] backdrop-blur-xl">
            <p className="text-xs text-[var(--text-soft)]">Inzicht</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">
              Beste dag: {bestDay ? `${bestDay.label} (${bestDay.value}%)` : "nog geen data"}.
            </p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">
              Zwaarste dag: {lowDay ? `${lowDay.label} (${lowDay.value}%)` : "nog geen data"}.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-zen)] backdrop-blur-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Emotie x energie
          </h2>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Gemiddelde energie op dagen waarop een emotie aanwezig was.
          </p>
          {emotionInsights.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">Nog te weinig data.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {emotionInsights.map((item) => (
                <li
                  key={item.emotion}
                  className="flex items-center justify-between rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2"
                >
                  <span className="text-sm text-[var(--text-primary)]">{item.emotion}</span>
                  <span className="text-sm font-semibold text-[#8ea0ff]">{item.avg}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-zen)] backdrop-blur-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Persoonlijk ritme</h2>
          <p className="mt-1 text-xs text-[var(--text-soft)]">
            Kleine inzichten uit je actuele check-ins.
          </p>
          <div className="mt-4 space-y-3 text-sm text-[var(--text-primary)]">
            <p>
              Beste weekdag:{" "}
              <span className="font-semibold text-[#8ea0ff]">
                {weekdayInsight ? `${weekdayInsight.day} (${weekdayInsight.avg}%)` : "—"}
              </span>
            </p>
            <p>
              Check-ins deze periode:{" "}
              <span className="font-semibold text-[#8ea0ff]">{completedDays}</span>
            </p>
            <p>
              Consistentie:{" "}
              <span className="font-semibold text-[#8ea0ff]">
                {Math.round((completedDays / period) * 100)}%
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
