"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GedachtenStep } from "./GedachtenStep";
import { GevoelStep } from "./GevoelStep";
import { LichaamStep } from "./LichaamStep";
import { EnergieStep } from "./EnergieStep";
import { GedragStep } from "./GedragStep";
import type { CheckInFormState } from "@/types/checkin";

const initialState: CheckInFormState = {
  thoughts: "",
  emotions: [],
  bodyParts: [],
  energyLevel: 50,
  behaviorMeta: {},
};

interface CheckInFormProps {
  onSubmit: (data: CheckInFormState) => Promise<{ ok: true } | { ok: false; offline?: boolean; error?: string }>;
}

export function CheckInForm({ onSubmit }: CheckInFormProps) {
  const router = useRouter();
  const [state, setState] = useState<CheckInFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await onSubmit(state);
      if (result.ok === false && result.offline) {
        setMessage(
          "Opgeslagen; wordt gesynchroniseerd wanneer je weer online bent."
        );
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2500);
      } else if (result.ok) {
        setMessage("Check-in opgeslagen");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else if (result.ok === false && result.error) {
        setMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-8 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
          Dagelijkse check-in
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">In 2 minuten klaar</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Focus op wat je nu voelt. Extra reflectie kun je optioneel toevoegen.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <GedachtenStep
            value={state.thoughts}
            onChange={(thoughts) => setState((s) => ({ ...s, thoughts }))}
          />
        </section>
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <GevoelStep
            selected={state.emotions}
            onToggle={(id) =>
              setState((s) => ({
                ...s,
                emotions: s.emotions.includes(id)
                  ? s.emotions.filter((e) => e !== id)
                  : [...s.emotions, id],
              }))
            }
          />
        </section>
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <LichaamStep
            selectedParts={state.bodyParts}
            onTogglePart={(id) =>
              setState((s) => ({
                ...s,
                bodyParts: s.bodyParts.includes(id)
                  ? s.bodyParts.filter((p) => p !== id)
                  : [...s.bodyParts, id],
              }))
            }
          />
        </section>
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <EnergieStep
            value={state.energyLevel}
            onChange={(energyLevel) => setState((s) => ({ ...s, energyLevel }))}
          />
        </section>

        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-4">
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="w-full rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--interactive-hover)]"
            aria-expanded={showOptional}
          >
            {showOptional ? "Verberg extra reflectie" : "Toon extra reflectie (optioneel)"}
          </button>
          {showOptional ? (
            <div className="mt-5">
              <GedragStep
                bewustAutonoom={state.behaviorMeta.bewust_autonoom}
                waardenCheck={state.behaviorMeta.waarden_check}
                onBewustAutonoom={(bewust_autonoom) =>
                  setState((s) => ({
                    ...s,
                    behaviorMeta: { ...s.behaviorMeta, bewust_autonoom },
                  }))
                }
                onWaardenCheck={(waarden_check) =>
                  setState((s) => ({
                    ...s,
                    behaviorMeta: { ...s.behaviorMeta, waarden_check },
                  }))
                }
              />
            </div>
          ) : null}
        </section>
      </div>

      {message && (
        <p
          className={`mt-6 text-sm ${
            message.includes("Opgeslagen") || message === "Check-in opgeslagen"
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="primary"
          className="w-full"
        >
          {isSubmitting ? "Opslaan…" : "Opslaan"}
        </Button>
      </div>
    </Card>
  );
}
