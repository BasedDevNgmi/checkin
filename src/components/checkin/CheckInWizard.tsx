"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BodyMapSVG } from "./BodyMapSVG";
import type { BodyPartId, CheckInFormState } from "@/types/checkin";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EMOTION_OPTIONS } from "@/types/checkin";

const STEPS = [
  { id: 0, title: "Denken", duration: "30 sec" },
  { id: 1, title: "Emoties", duration: "30 sec" },
  { id: 2, title: "Lijf", duration: "30 sec" },
  { id: 3, title: "Energie", duration: "30 sec" },
  { id: 4, title: "Gedrag", duration: "30 sec" },
];

const initialState: CheckInFormState = {
  thoughts: "",
  emotions: [],
  bodyParts: [],
  energyLevel: 50,
  behaviorMeta: {},
};

interface CheckInWizardProps {
  onSubmit: (data: CheckInFormState) => Promise<{ ok: true } | { ok: false; offline?: boolean; error?: string }>;
}

export function CheckInWizard({ onSubmit }: CheckInWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<CheckInFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  function toggleEmotion(id: string) {
    setState((s) => ({
      ...s,
      emotions: s.emotions.includes(id)
        ? s.emotions.filter((e) => e !== id)
        : [...s.emotions, id],
    }));
  }

  function toggleBodyPart(id: BodyPartId) {
    setState((s) => ({
      ...s,
      bodyParts: s.bodyParts.includes(id)
        ? s.bodyParts.filter((p) => p !== id)
        : [...s.bodyParts, id],
    }));
  }

  function handleNext() {
    if (isLast) return;
    setStep((s) => s + 1);
  }

  function handlePrev() {
    if (isFirst) return;
    setStep((s) => s - 1);
  }

  async function handleFinish() {
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

  function renderStep() {
    if (step === 0) {
      return (
        <section className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Begin bij het denken, wat gaat er op dit moment door je hoofd? Schrijf dit op in de gedachtewolk, dit mag in volzinnen, het mag ook in woorden (30 seconden).
          </p>
          <div className="relative mx-auto max-w-md">
            <div className="relative rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-5 shadow-[var(--shadow-zen)]">
              <span className="absolute -top-0.5 left-8 h-6 w-8 rounded-full border-2 border-[var(--surface-border)] bg-[var(--surface-glass-strong)]" aria-hidden />
              <span className="absolute -top-0.5 right-12 h-5 w-6 rounded-full border-2 border-[var(--surface-border)] bg-[var(--surface-glass-strong)]" aria-hidden />
              <textarea
                value={state.thoughts}
                onChange={(e) => setState((s) => ({ ...s, thoughts: e.target.value }))}
                placeholder="Bijv. Ik voel drukte in mijn hoofd, maar ook opluchting..."
                className="relative z-10 min-h-32 w-full resize-y rounded-2xl border-0 bg-transparent p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:ring-0"
                aria-label="Gedachtewolk"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-soft)]">Neem ongeveer 30 seconden</p>
        </section>
      );
    }

    if (step === 1) {
      return (
        <section className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Sta nu stil bij je emoties, welke emoties zijn nu aanwezig? Een goed startpunt kunnen de basisemoties zijn: blij, bang, bedroefd, boos. Het kan zijn dat je meerdere emoties tegelijk voelt, het kan zijn dat je je neutraal voelt; ook dat is prima (30 seconden).
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EMOTION_OPTIONS.map(({ id, label, emoji }) => {
              const selected = state.emotions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleEmotion(id)}
                  className={`rounded-[var(--radius-card)] border px-3 py-3 text-left transition ${
                    selected
                      ? "border-violet-400 bg-violet-100/80 text-violet-900 dark:bg-violet-300/20 dark:text-violet-100"
                      : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-primary)] hover:bg-[var(--interactive-hover)]"
                  }`}
                  aria-pressed={selected}
                >
                  <span className="block text-lg">{emoji}</span>
                  <span className="mt-1 block text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-soft)]">Neem ongeveer 30 seconden</p>
        </section>
      );
    }

    if (step === 2) {
      return (
        <section className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Vervolgens richt je je aandacht op je lijf, wat is daar te voelen? Mocht je bepaalde sensaties opmerken, kun je dat deel van je lijf omcirkelen en erbij schrijven wat je voelt (30 seconden).
          </p>
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3">
            <BodyMapSVG selectedParts={state.bodyParts} onTogglePart={toggleBodyPart} />
          </div>
          <textarea
            value={state.behaviorMeta.body_sensations ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                behaviorMeta: { ...s.behaviorMeta, body_sensations: e.target.value },
              }))
            }
            placeholder="Bijv. druk op borst, warme schouders, onrust in buik..."
            className="min-h-24 w-full resize-y rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
            aria-label="Lichaamssensaties notitie"
          />
          <p className="text-xs text-[var(--text-soft)]">Neem ongeveer 30 seconden</p>
        </section>
      );
    }

    if (step === 3) {
      const pct = state.energyLevel;
      return (
        <section className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Vervolgens verschuif je je aandacht naar je energie, hoe staat het ervoor met de batterij (30 seconden).
          </p>
          <div className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
            <div className="mx-auto flex max-w-[200px] flex-col items-center gap-3">
              <div
                className="relative h-14 w-24 rounded-lg border-2 border-[var(--text-muted)] bg-[var(--surface-glass)] p-1"
                aria-hidden
              >
                <div
                  className="absolute bottom-1 left-1 right-1 rounded-md bg-[var(--accent-soft)] transition-all duration-200"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--text-muted)]">Batterij</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={state.energyLevel}
              onChange={(e) =>
                setState((s) => ({ ...s, energyLevel: Number(e.target.value) }))
              }
              className="mt-4 w-full accent-violet-500"
              aria-label="Energie niveau"
            />
            <p className="mt-2 text-center text-xl font-semibold text-[var(--accent-soft)]">
              {state.energyLevel}%
            </p>
          </div>
          <p className="text-xs text-[var(--text-soft)]">Neem ongeveer 30 seconden</p>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Tenslotte sta je stil bij je gedrag, wat was je net aan het doen? Deed je dit bewust, of op de automatische piloot? Doe je dit omdat je het belangrijk vindt? Wil je hiermee doorgaan of wil je je gedrag wellicht iets bijstellen (30 seconden)?
        </p>
        <textarea
          value={state.behaviorMeta.activity_now ?? ""}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              behaviorMeta: { ...s.behaviorMeta, activity_now: e.target.value },
            }))
          }
          placeholder="Wat was je net aan het doen?"
          className="min-h-20 w-full resize-y rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
          aria-label="Activiteit notitie"
        />
        <div className="grid grid-cols-2 gap-3">
          {(["Bewust", "Autonoom"] as const).map((opt) => {
            const selected = state.behaviorMeta.bewust_autonoom === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    behaviorMeta: { ...s.behaviorMeta, bewust_autonoom: opt },
                  }))
                }
                className={`rounded-[var(--radius-card)] border px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-violet-400 bg-violet-100/80 text-violet-900 dark:bg-violet-300/20 dark:text-violet-100"
                    : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-primary)] hover:bg-[var(--interactive-hover)]"
                }`}
                aria-pressed={selected}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--text-muted)]">Doe je dit omdat je het belangrijk vindt?</p>
        <div className="flex gap-2">
          {([true, false] as const).map((val) => {
            const selected = state.behaviorMeta.waarden_check === val;
            return (
              <button
                key={String(val)}
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    behaviorMeta: { ...s.behaviorMeta, waarden_check: val },
                  }))
                }
                className={`rounded-[var(--radius-card)] border px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-violet-400 bg-violet-100/80 text-violet-900 dark:bg-violet-300/20 dark:text-violet-100"
                    : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-primary)] hover:bg-[var(--interactive-hover)]"
                }`}
                aria-pressed={selected}
              >
                {val ? "Ja" : "Nee"}
              </button>
            );
          })}
        </div>
        <textarea
          value={state.behaviorMeta.values_reason ?? ""}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              behaviorMeta: { ...s.behaviorMeta, values_reason: e.target.value },
            }))
          }
          placeholder="Waarom wel of niet?"
          className="min-h-20 w-full resize-y rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
          aria-label="Waarden reflectie"
        />
        <textarea
          value={state.behaviorMeta.behavior_next ?? ""}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              behaviorMeta: { ...s.behaviorMeta, behavior_next: e.target.value },
            }))
          }
          placeholder="Wil je hiermee doorgaan of je gedrag iets bijstellen?"
          className="min-h-20 w-full resize-y rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
          aria-label="Gedrag vervolg"
        />
        <p className="text-xs text-[var(--text-soft)]">Neem ongeveer 30 seconden</p>
      </section>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          De 5 vragen
        </h1>
      </div>
      <div
        className="mb-5 h-1 w-full overflow-hidden rounded-full bg-[var(--interactive-hover)]"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label="Voortgang check-in"
      >
        <motion.div
          className="h-full rounded-full bg-[var(--accent-soft)]"
          initial={false}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="flex items-center gap-1 text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
          aria-label="Vorige stap"
        >
          <ChevronLeft className="h-5 w-5" />
          Vorige
        </button>
        <span className="text-center text-sm text-[var(--text-muted)]">
          Stap {step + 1} / {STEPS.length} · {STEPS[step].duration}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={isLast}
          className="flex items-center gap-1 text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
          aria-label="Volgende stap"
        >
          Volgende
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 sm:p-6"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-soft)]">
            Stap {step + 1}: {STEPS[step].title}
          </p>
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("Opgeslagen") || message === "Check-in opgeslagen"
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-soft)]">
          Tip: houd het kort. Je kunt later altijd meer aanvullen.
        </p>
        {isLast ? (
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            variant="primary"
          >
            {isSubmitting ? "Opslaan…" : "Check-in afronden"}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="primary">
            Volgende stap
          </Button>
        )}
      </div>
    </Card>
  );
}
