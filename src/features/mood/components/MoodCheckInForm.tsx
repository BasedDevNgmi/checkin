"use client";

import { useState } from "react";
import type { MoodCheckIn, MoodValue } from "@/core/storage/models";
import { emotionOptions } from "@/features/mood/constants";

interface MoodCheckInFormProps {
  onCreate: (input: {
    valence: MoodValue;
    energy: MoodValue;
    emotions: string[];
    note: string;
  }) => Promise<MoodCheckIn>;
}

function toMoodValue(value: number): MoodValue {
  return Math.max(1, Math.min(10, Math.round(value))) as MoodValue;
}

export function MoodCheckInForm({ onCreate }: MoodCheckInFormProps) {
  const [valence, setValence] = useState<MoodValue>(6);
  const [energy, setEnergy] = useState<MoodValue>(6);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleEmotion(emotion: string) {
    setEmotions((current) =>
      current.includes(emotion)
        ? current.filter((item) => item !== emotion)
        : [...current, emotion]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await onCreate({
        valence,
        energy,
        emotions,
        note: note.trim(),
      });
      setSuccessMessage("Mood check-in saved.");
      setNote("");
      setEmotions([]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-zen backdrop-blur-xl"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
          Today Check-In
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          How is your inner weather?
        </h2>
      </div>

      <label className="block text-sm text-[var(--text-muted)]">
        Mood valence: <span className="font-semibold text-[var(--text-primary)]">{valence}/10</span>
        <input
          type="range"
          min={1}
          max={10}
          value={valence}
          onChange={(event) => setValence(toMoodValue(Number(event.target.value)))}
          className="mt-2 w-full accent-violet-500"
        />
      </label>

      <label className="block text-sm text-[var(--text-muted)]">
        Energy: <span className="font-semibold text-[var(--text-primary)]">{energy}/10</span>
        <input
          type="range"
          min={1}
          max={10}
          value={energy}
          onChange={(event) => setEnergy(toMoodValue(Number(event.target.value)))}
          className="mt-2 w-full accent-violet-500"
        />
      </label>

      <div>
        <p className="mb-2 text-sm text-[var(--text-muted)]">Emotions</p>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map((emotion) => {
            const selected = emotions.includes(emotion);
            return (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                className={`rounded-[14px] border px-3 py-1.5 text-xs transition ${
                  selected
                    ? "border-violet-400 bg-violet-100 text-violet-900 dark:bg-violet-400/20 dark:text-violet-100"
                    : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)]"
                }`}
                aria-pressed={selected}
              >
                {emotion}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-[var(--text-muted)]">Optional note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-24 w-full rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)]"
          placeholder="A short reflection..."
        />
      </label>

      <div className="flex items-center justify-between">
        {successMessage ? <p className="text-xs text-emerald-600">{successMessage}</p> : <span />}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[14px] bg-gradient-to-b from-[#6f63ff] to-[#5a4fff] px-4 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Saving..." : "Save check-in"}
        </button>
      </div>
    </form>
  );
}
