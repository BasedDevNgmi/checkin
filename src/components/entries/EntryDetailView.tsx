"use client";

import type { CheckInRow } from "@/types/checkin";

interface EntryDetailViewProps {
  checkin: CheckInRow;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EntryDetailView({ checkin }: EntryDetailViewProps) {
  return (
    <article className="max-w-2xl space-y-8">
      <header>
        <p className="text-sm text-[var(--text-soft)]">{formatDate(checkin.created_at)}</p>
        {checkin.energy_level != null && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {checkin.energy_level}% energie
          </p>
        )}
      </header>

      {checkin.thoughts ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
            Gedachten
          </h3>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]">
            {checkin.thoughts}
          </p>
        </section>
      ) : null}

      {checkin.emotions?.length > 0 ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
            Gevoel
          </h3>
          <p className="text-base text-[var(--text-primary)]">{checkin.emotions.join(", ")}</p>
        </section>
      ) : null}

      {checkin.body_parts?.length > 0 ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
            Lichaam
          </h3>
          <p className="capitalize text-base text-[var(--text-primary)]">
            {checkin.body_parts.join(", ").replace(/_/g, " ")}
          </p>
          {checkin.behavior_meta?.body_sensations ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
              {checkin.behavior_meta.body_sensations}
            </p>
          ) : null}
        </section>
      ) : null}

      {checkin.energy_level != null ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
            Energie
          </h3>
          <p className="text-base text-[var(--text-primary)]">{checkin.energy_level}%</p>
        </section>
      ) : null}

      {checkin.behavior_meta &&
        (checkin.behavior_meta.bewust_autonoom ||
          checkin.behavior_meta.waarden_check != null ||
          checkin.behavior_meta.activity_now ||
          checkin.behavior_meta.values_reason ||
          checkin.behavior_meta.behavior_next) ? (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)]">
            Gedrag
          </h3>
          <div className="space-y-2 text-base leading-relaxed text-[var(--text-primary)]">
            {checkin.behavior_meta.bewust_autonoom && (
              <p>Bewust / Autonoom: {checkin.behavior_meta.bewust_autonoom}</p>
            )}
            {checkin.behavior_meta.waarden_check != null && (
              <p>Waarden-check: {checkin.behavior_meta.waarden_check ? "Ja" : "Nee"}</p>
            )}
            {checkin.behavior_meta.activity_now ? (
              <p className="whitespace-pre-wrap">Activiteit: {checkin.behavior_meta.activity_now}</p>
            ) : null}
            {checkin.behavior_meta.values_reason ? (
              <p className="whitespace-pre-wrap">
                Belangrijk omdat: {checkin.behavior_meta.values_reason}
              </p>
            ) : null}
            {checkin.behavior_meta.behavior_next ? (
              <p className="whitespace-pre-wrap">
                Volgende stap: {checkin.behavior_meta.behavior_next}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </article>
  );
}
