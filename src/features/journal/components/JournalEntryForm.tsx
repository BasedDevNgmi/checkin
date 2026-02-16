"use client";

import { useMemo, useState } from "react";
import type { JournalEntry, MoodCheckIn, MoodValue } from "@/core/storage/models";

interface JournalEntryFormProps {
  moods: MoodCheckIn[];
  onCreate: (input: {
    title: string;
    body: string;
    tags: string[];
    moodLinkId: string | null;
    context: JournalEntry["context"];
  }) => Promise<JournalEntry>;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function toMoodValue(value: number): MoodValue {
  return Math.max(1, Math.min(10, Math.round(value))) as MoodValue;
}

export function JournalEntryForm({ moods, onCreate }: JournalEntryFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [moodLinkId, setMoodLinkId] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [stressLevel, setStressLevel] = useState<MoodValue>(5);
  const [socialBattery, setSocialBattery] = useState<MoodValue>(5);
  const [triggers, setTriggers] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [intention, setIntention] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const latestMoods = useMemo(() => moods.slice(0, 10), [moods]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        body: body.trim(),
        tags: parseTags(tagsText),
        moodLinkId: moodLinkId || null,
        context: {
          sleepHours: sleepHours ? Number(sleepHours) : null,
          stressLevel,
          socialBattery,
          triggers: parseTags(triggers),
          gratitude: gratitude.trim(),
          intention: intention.trim(),
        },
      });
      setTitle("");
      setBody("");
      setTagsText("");
      setMoodLinkId("");
      setSleepHours("");
      setTriggers("");
      setGratitude("");
      setIntention("");
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
          Deep Journal
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          Capture your full state of mind
        </h2>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title (optional)"
        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
      />

      <textarea
        required
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What happened, what are you feeling, what do you need?"
        className="min-h-28 w-full rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)]"
      />

      <input
        value={tagsText}
        onChange={(event) => setTagsText(event.target.value)}
        placeholder="Tags, comma separated (work, rest, family)"
        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
      />

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--text-soft)]">Link mood check-in</span>
        <select
          value={moodLinkId}
          onChange={(event) => setMoodLinkId(event.target.value)}
          className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="">No mood linked</option>
          {latestMoods.map((mood) => (
            <option key={mood.id} value={mood.id}>
              {new Date(mood.createdAt).toLocaleDateString()} - mood {mood.valence}/10
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={sleepHours}
          onChange={(event) => setSleepHours(event.target.value)}
          type="number"
          min={0}
          max={24}
          step={0.5}
          placeholder="Sleep hrs"
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <label className="text-xs text-[var(--text-soft)]">
          Stress {stressLevel}
          <input
            type="range"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(event) => setStressLevel(toMoodValue(Number(event.target.value)))}
            className="mt-1 w-full accent-violet-500"
          />
        </label>
        <label className="text-xs text-[var(--text-soft)]">
          Social {socialBattery}
          <input
            type="range"
            min={1}
            max={10}
            value={socialBattery}
            onChange={(event) => setSocialBattery(toMoodValue(Number(event.target.value)))}
            className="mt-1 w-full accent-violet-500"
          />
        </label>
      </div>

      <input
        value={triggers}
        onChange={(event) => setTriggers(event.target.value)}
        placeholder="Triggers, comma separated"
        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
      />

      <textarea
        value={gratitude}
        onChange={(event) => setGratitude(event.target.value)}
        placeholder="Gratitude"
        className="min-h-16 w-full rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)]"
      />
      <textarea
        value={intention}
        onChange={(event) => setIntention(event.target.value)}
        placeholder="Intention for the next hours"
        className="min-h-16 w-full rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-3 text-sm text-[var(--text-primary)]"
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[14px] bg-gradient-to-b from-[#6f63ff] to-[#5a4fff] px-4 py-2 text-sm font-medium text-white"
      >
        {submitting ? "Saving..." : "Save journal"}
      </button>
    </form>
  );
}
