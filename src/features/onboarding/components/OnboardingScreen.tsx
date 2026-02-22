"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/core/telemetry/events";
import { useMindJournal } from "@/features/app/useMindJournal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      trackEvent("onboarding_completed");
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-5">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">
            Welkom
          </p>
          <h1 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Rond je profiel af
          </h1>
          <p className="mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed">
            Je check-ins worden lokaal opgeslagen en kunnen later gesynchroniseerd worden.
          </p>
        </div>
        <div className="space-y-4">
          <Input
            label="Naam"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Je naam"
            autoComplete="name"
          />
          <Input
            label="Tijdzone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Tijdzone"
          />
        </div>
        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? "Opslaan…" : "Start met inchecken"}
        </Button>
      </form>
    </div>
  );
}
