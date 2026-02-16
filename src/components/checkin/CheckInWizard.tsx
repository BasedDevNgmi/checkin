"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BodyMapSVG } from "./BodyMapSVG";
import type { BodyPartId, CheckInFormState } from "@/types/checkin";
import { ChevronLeft } from "lucide-react";
import { EMOTION_OPTIONS } from "@/types/checkin";

const STEPS = [
  {
    id: 0,
    title: "Wat gaat er door je hoofd?",
    subtitle: "Schrijf kort je gedachten — in woorden of zinnen.",
    key: "denken",
  },
  {
    id: 1,
    title: "Welke emoties zijn er nu?",
    subtitle: "Kies een of meerdere die bij je passen.",
    key: "emoties",
  },
  {
    id: 2,
    title: "Wat voel je in je lichaam?",
    subtitle: "Tik op de plekken waar je iets merkt. Optioneel: schrijf erbij wat je voelt.",
    key: "lijf",
  },
  {
    id: 3,
    title: "Hoe staat je batterij?",
    subtitle: "Sleep de schuif naar je energie van nu (0–100%).",
    key: "energie",
  },
  {
    id: 4,
    title: "Bewust of automatisch?",
    subtitle: "Wat deed je net? Doe je dit omdat je het belangrijk vindt?",
    key: "gedrag",
  },
] as const;

const initialState: CheckInFormState = {
  thoughts: "",
  emotions: [],
  bodyParts: [],
  energyLevel: 50,
  behaviorMeta: {},
};

interface CheckInWizardProps {
  onSubmit: (data: CheckInFormState) => Promise<
    | { ok: true }
    | { ok: false; offline?: boolean; error?: string }
  >;
  initialData?: CheckInFormState;
  successRedirect?: string;
}

export function CheckInWizard({
  onSubmit,
  initialData,
  successRedirect,
}: CheckInWizardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<CheckInFormState>(initialData ?? initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

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
        setMessage(
          successRedirect ? "Bewerking opgeslagen" : "Check-in opgeslagen"
        );
        setTimeout(() => {
          router.push(successRedirect ?? "/dashboard");
          router.refresh();
        }, 1500);
      } else if (result.ok === false && result.error) {
        setMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const controlClass = (selected: boolean) =>
    selected
      ? "border-[var(--accent)] bg-[var(--interactive-active)] text-[var(--text-primary)]"
      : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]";

  function renderStepContent() {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
            <textarea
              value={state.thoughts}
              onChange={(e) =>
                setState((s) => ({ ...s, thoughts: e.target.value }))
              }
              placeholder="Bijv. drukte in mijn hoofd, maar ook opluchting…"
              rows={4}
              className="min-h-[120px] w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
              aria-label="Gedachten"
            />
          </div>
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EMOTION_OPTIONS.map(({ id, label, emoji }) => {
              const selected = state.emotions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleEmotion(id)}
                  className={`flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 px-3 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${controlClass(
                    selected
                  )}`}
                  aria-pressed={selected}
                  aria-label={label}
                >
                  <span className="text-2xl" role="img" aria-hidden>
                    {emoji}
                  </span>
                  <span className="text-[15px] font-medium">{label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div className="flex justify-center py-2">
            <BodyMapSVG
              selectedParts={state.bodyParts}
              onTogglePart={toggleBodyPart}
            />
          </div>
          <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
            <textarea
              value={state.behaviorMeta.body_sensations ?? ""}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  behaviorMeta: {
                    ...s.behaviorMeta,
                    body_sensations: e.target.value,
                  },
                }))
              }
              placeholder="Bijv. druk op borst, warme schouders…"
              rows={2}
              className="w-full resize-none border-0 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
              aria-label="Lichaamssensaties"
            />
          </div>
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    if (step === 3) {
      const pct = state.energyLevel;
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative h-40 w-24 flex-shrink-0 overflow-hidden rounded-[14px] border-2 border-[var(--surface-border)] bg-[var(--surface-glass)]"
              style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.06)" }}
              aria-hidden
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-[12px] bg-gradient-to-t from-[var(--accent)] to-[var(--accent-soft)] transition-all duration-200"
                style={{ height: `${pct}%` }}
              />
            </div>
            <p className="text-[22px] font-semibold tabular-nums text-[var(--accent)]">
              {pct}%
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={state.energyLevel}
            onChange={(e) =>
              setState((s) => ({ ...s, energyLevel: Number(e.target.value) }))
            }
            className="h-3 w-full max-w-xs cursor-pointer accent-[var(--accent)]"
            aria-label="Energieniveau 0 tot 100 procent"
          />
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    // Step 4: Gedrag
    return (
      <div className="space-y-6">
        <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
          <textarea
            value={state.behaviorMeta.activity_now ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                behaviorMeta: { ...s.behaviorMeta, activity_now: e.target.value },
              }))
            }
            placeholder="Wat was je net aan het doen?"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
            aria-label="Activiteit"
          />
        </div>

        <div>
          <p className="mb-2 text-[15px] font-medium text-[var(--text-muted)]">
            Bewust of automatisch?
          </p>
          <div className="flex gap-3">
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
                  className={`flex-1 min-h-[48px] rounded-[12px] border-2 px-4 py-3 text-[15px] font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${controlClass(
                    selected
                  )}`}
                  aria-pressed={selected}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[15px] font-medium text-[var(--text-muted)]">
            Doe je dit omdat je het belangrijk vindt?
          </p>
          <div className="flex gap-3">
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
                  className={`flex-1 min-h-[48px] rounded-[12px] border-2 px-4 py-3 text-[15px] font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${controlClass(
                    selected
                  )}`}
                  aria-pressed={selected}
                >
                  {val ? "Ja" : "Nee"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
          <textarea
            value={state.behaviorMeta.values_reason ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                behaviorMeta: {
                  ...s.behaviorMeta,
                  values_reason: e.target.value,
                },
              }))
            }
            placeholder="Waarom wel of niet? (optioneel)"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
            aria-label="Waarden reflectie"
          />
        </div>
        <div className="rounded-[12px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-4">
          <textarea
            value={state.behaviorMeta.behavior_next ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                behaviorMeta: {
                  ...s.behaviorMeta,
                  behavior_next: e.target.value,
                },
              }))
            }
            placeholder="Wil je hiermee doorgaan of iets bijstellen? (optioneel)"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
            aria-label="Gedrag vervolg"
          />
        </div>
        <p className="text-[13px] text-[var(--text-soft)]">
          Ongeveer 30 seconden
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Progress — Apple-style thin bar + label */}
      <div className="mb-6">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-[var(--interactive-hover)]"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Stap ${step + 1} van ${STEPS.length}`}
        >
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-[13px] text-[var(--text-soft)]">
          {step + 1} van {STEPS.length}
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
          transition={reduceMotion ? {} : { duration: 0.25, ease: "easeOut" }}
          className="min-h-[280px]"
        >
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
            {current.title}
          </h2>
          <p className="mt-2 text-[15px] text-[var(--text-muted)]">
            {current.subtitle}
          </p>
          <div className="mt-6">{renderStepContent()}</div>
        </motion.div>
      </AnimatePresence>

      {message && (
        <p
          className={`mt-4 text-[15px] ${
            message.includes("Opgeslagen") || message === "Check-in opgeslagen"
              ? "text-[var(--accent)]"
              : "text-rose-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Bottom navigation — Apple-style: Back + primary action */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--surface-border)]/60 pt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="flex min-h-[44px] items-center gap-1 rounded-[12px] px-3 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
          aria-label="Vorige stap"
        >
          <ChevronLeft className="h-5 w-5" />
          Terug
        </button>
        {isLast ? (
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            variant="primary"
            className="min-h-[44px]"
          >
            {isSubmitting ? "Opslaan…" : "Afronden"}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="primary" className="min-h-[44px]">
            Volgende
          </Button>
        )}
      </div>
    </div>
  );
}
