"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BodyMapSVG } from "./BodyMapSVG";
import type { BodyPartId, CheckInFormState } from "@/types/checkin";
import { Check, ChevronLeft } from "lucide-react";
import { EMOTION_OPTIONS } from "@/types/checkin";
import { EASE_SMOOTH } from "@/lib/motion";

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
    | { ok: false; error?: string }
  >;
  initialData?: CheckInFormState;
  successRedirect?: string;
  onSuccess?: () => void | Promise<void>;
}

const TRANSITION = { duration: 0.35, ease: EASE_SMOOTH };

export function CheckInWizard({
  onSubmit,
  initialData,
  successRedirect,
  onSuccess,
}: CheckInWizardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<CheckInFormState>(initialData ?? initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
      if (result.ok) {
        setShowSuccess(true);
        void Promise.resolve(onSuccess?.())
          .catch(() => {})
          .then(() => {
            setTimeout(() => {
              router.push(successRedirect ?? "/dashboard");
              router.refresh();
            }, reduceMotion ? 400 : 600);
          });
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
      : "border-[var(--surface-border)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]";

  const textareaClass =
    "w-full resize-none rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 text-[15px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus-visible:outline-none focus-visible:border-[var(--focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] transition";

  function renderStepContent() {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <textarea
            value={state.thoughts}
            onChange={(e) =>
              setState((s) => ({ ...s, thoughts: e.target.value }))
            }
            placeholder="Bijv. drukte in mijn hoofd, maar ook opluchting…"
            rows={5}
            className={`${textareaClass} min-h-[140px]`}
            aria-label="Gedachten"
          />
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EMOTION_OPTIONS.map(({ id, label, emoji }) => {
              const selected = state.emotions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleEmotion(id)}
                  className={`flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${controlClass(
                    selected
                  )}`}
                  aria-pressed={selected}
                  aria-label={label}
                >
                  <span className="text-[22px]" role="img" aria-hidden>
                    {emoji}
                  </span>
                  <span className="text-[13px] font-medium">{label}</span>
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
            className={textareaClass}
            aria-label="Lichaamssensaties"
          />
          <p className="text-[13px] text-[var(--text-soft)]">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    if (step === 3) {
      const pct = state.energyLevel;
      return (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-5">
            <div
              className="relative h-40 w-20 flex-shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--interactive-hover)]"
              aria-hidden
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-[9px] bg-[var(--accent)] transition-all duration-300"
                style={{ height: `${pct}%`, opacity: 0.7 + (pct / 100) * 0.3 }}
              />
            </div>
            <p className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--text-primary)]">
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
            className="h-2 w-full max-w-xs mx-auto block cursor-pointer accent-[var(--accent)]"
            aria-label="Energieniveau 0 tot 100 procent"
          />
          <p className="text-[13px] text-[var(--text-soft)] text-center">
            Ongeveer 30 seconden
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
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
          className={textareaClass}
          aria-label="Activiteit"
        />

        <div>
          <p className="mb-2.5 text-[13px] font-medium text-[var(--text-muted)]">
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
                  className={`flex-1 min-h-[48px] rounded-[var(--radius-control)] border px-4 py-3 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${controlClass(
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
          <p className="mb-2.5 text-[13px] font-medium text-[var(--text-muted)]">
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
                  className={`flex-1 min-h-[48px] rounded-[var(--radius-control)] border px-4 py-3 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${controlClass(
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
          className={textareaClass}
          aria-label="Waarden reflectie"
        />
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
          className={textareaClass}
          aria-label="Gedrag vervolg"
        />
        <p className="text-[13px] text-[var(--text-soft)]">
          Ongeveer 30 seconden
        </p>
      </div>
    );
  }

  if (showSuccess) {
    const successLabel = successRedirect ? "Bewerking opgeslagen" : "Check-in opgeslagen";
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="mx-auto max-w-lg flex min-h-[280px] flex-col items-center justify-center py-16"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: EASE_SMOOTH }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text-success)]/15 text-[var(--text-success)]"
        >
          <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden />
        </motion.div>
        <p className="mt-5 text-[17px] font-semibold text-[var(--text-primary)]">
          {successLabel}
        </p>
        <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
          Je wordt doorgestuurd…
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <div
          className="h-0.5 w-full overflow-hidden rounded-full bg-[var(--surface-border)]"
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
            transition={reduceMotion ? { duration: 0 } : TRANSITION}
          />
        </div>
        <p className="mt-2.5 text-[13px] text-[var(--text-soft)]">
          {step + 1} van {STEPS.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? {} : { opacity: 0, y: -4 }}
          transition={reduceMotion ? {} : TRANSITION}
          className="min-h-[280px]"
        >
          <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-primary)]">
            {current.title}
          </h2>
          <p className="mt-2.5 text-[13px] text-[var(--text-muted)] leading-relaxed">
            {current.subtitle}
          </p>
          <div className="mt-8">{renderStepContent()}</div>
        </motion.div>
      </AnimatePresence>

      {message && (
        <p
          className={`mt-4 text-[13px] ${
            message.includes("Opgeslagen") || message === "Check-in opgeslagen"
              ? "text-[var(--text-success)]"
              : "text-[var(--text-error)]"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--surface-border)] pt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="flex min-h-[44px] items-center gap-1 rounded-[var(--radius-control)] px-3 py-2.5 text-[15px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
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
