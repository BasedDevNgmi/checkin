"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMindJournal } from "@/features/app/useMindJournal";

export function OnboardingScreen() {
  const router = useRouter();
  const { savePreferences } = useMindJournal();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await savePreferences({
        name: name.trim() || "Jij",
        timezone,
        reminderEnabled: false,
        reminderTime: null,
        theme: "system",
      });
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-zen"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">Welkom</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Rond je profiel af
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Je check-ins worden lokaal opgeslagen en kunnen later met Supabase gesynchroniseerd worden.
        </p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Je naam"
          className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
        />
        <input
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          placeholder="Tijdzone"
          className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Opslaan…" : "Start met inchecken"}
        </button>
      </form>
    </div>
  );
}
