"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deleteCheckIn } from "@/lib/checkin";
import type { CheckInRow } from "@/types/checkin";
import { Pencil, Trash2 } from "lucide-react";

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
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze check-in wilt verwijderen?")) return;
    setIsDeleting(true);
    try {
      const result = await deleteCheckIn(checkin.id);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(result.ok === false && "error" in result ? result.error : "Verwijderen mislukt.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={`/entries/${checkin.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--interactive-hover)]"
        >
          <Pencil className="h-4 w-4" /> Bewerken
        </Link>
        <Button
          type="button"
          variant="secondary"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-4 w-4" /> {isDeleting ? "Verwijderen…" : "Verwijderen"}
        </Button>
      </div>
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
    </Card>
  );
}
