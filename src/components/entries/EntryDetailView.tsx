"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteCheckIn } from "@/lib/checkin";
import { EMOTION_OPTIONS, type CheckInRow } from "@/types/checkin";
import { Pencil, Trash2 } from "lucide-react";

const EMOJI_MAP: Map<string, string> = new Map(EMOTION_OPTIONS.map((e) => [e.id, e.emoji]));

function energyColor(level: number): string {
  if (level >= 70) return "var(--text-success)";
  if (level >= 40) return "#d9a038";
  return "var(--text-error)";
}

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDeleteClick() {
    setDeleteError(null);
    setShowConfirm(true);
  }

  function handleCancelDelete() {
    setShowConfirm(false);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteCheckIn(checkin.id);
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setDeleteError(
          result.ok === false && "error" in result ? result.error : "Verwijderen mislukt."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {!showConfirm ? (
          <>
            <Link
              href={`/entries/${checkin.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--surface-border)] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <Pencil className="h-4 w-4" /> Bewerken
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Verwijderen
            </Button>
          </>
        ) : (
          <div className="glass-panel flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] px-3 py-2">
            <span className="text-[13px] text-[var(--text-muted)]">Verwijderen?</span>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="min-h-[var(--tap-min-height)] py-1.5 px-2.5 text-[13px]"
            >
              Annuleren
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="min-h-[var(--tap-min-height)] py-1.5 px-2.5 text-[13px] border-[var(--text-error)] text-[var(--text-error)] hover:bg-[var(--text-error)]/10 active:bg-[var(--text-error)]/20"
            >
              {isDeleting ? "Bezig…" : "Verwijderen"}
            </Button>
          </div>
        )}
      </div>
      {deleteError && (
        <p className="mb-4 text-[13px] text-[var(--text-error)]">{deleteError}</p>
      )}
      <article className="max-w-3xl space-y-4">
        <header className="glass-card rounded-[var(--radius-card)] p-5">
          <p suppressHydrationWarning className="text-[13px] font-medium text-[var(--text-muted)]">{formatDate(checkin.created_at)}</p>
          {checkin.energy_level != null && (
            <div className="mt-2 flex items-center gap-2.5">
              <div className="h-1.5 w-20 rounded-full bg-[var(--interactive-hover)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${checkin.energy_level}%`,
                    backgroundColor: energyColor(checkin.energy_level),
                  }}
                />
              </div>
              <span className="text-[13px] tabular-nums font-medium" style={{ color: energyColor(checkin.energy_level) }}>
                {checkin.energy_level}%
              </span>
            </div>
          )}
        </header>

        {checkin.thoughts ? (
          <section className="glass-card rounded-[var(--radius-card)] p-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
              Gedachten
            </h3>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text-primary)]">
              {checkin.thoughts}
            </p>
          </section>
        ) : null}

        {checkin.emotions?.length > 0 ? (
          <section className="glass-card rounded-[var(--radius-card)] p-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
              Gevoel
            </h3>
            <div className="flex flex-wrap gap-2">
              {checkin.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] bg-[var(--interactive-hover)] px-3 py-1 text-[13px] font-medium text-[var(--text-primary)]"
                >
                  {EMOJI_MAP.get(emotion) && <span aria-hidden>{EMOJI_MAP.get(emotion)}</span>}
                  {emotion}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {checkin.body_parts?.length > 0 ? (
          <section className="glass-card rounded-[var(--radius-card)] p-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
              Lichaam
            </h3>
            <p className="capitalize text-[15px] text-[var(--text-primary)]">
              {checkin.body_parts.join(", ").replace(/_/g, " ")}
            </p>
            {checkin.behavior_meta?.body_sensations ? (
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--text-muted)]">
                {checkin.behavior_meta.body_sensations}
              </p>
            ) : null}
          </section>
        ) : null}

        {checkin.behavior_meta &&
          (checkin.behavior_meta.bewust_autonoom ||
            checkin.behavior_meta.waarden_check != null ||
            checkin.behavior_meta.activity_now ||
            checkin.behavior_meta.values_reason ||
            checkin.behavior_meta.behavior_next) ? (
          <section className="glass-card rounded-[var(--radius-card)] p-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-soft)]">
              Gedrag
            </h3>
            <div className="space-y-2 text-[15px] leading-relaxed text-[var(--text-primary)]">
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
    </div>
  );
}
