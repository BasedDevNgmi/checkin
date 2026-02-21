"use client";

import { useRef, useState } from "react";
import type { BackupPayload, UserPreferences } from "@/core/storage/models";
import type { CheckInRow } from "@/types/checkin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

const selectClass =
  "w-full rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 text-[15px] text-[var(--text-primary)] focus-visible:border-[var(--focus-ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] transition disabled:opacity-50";

interface SettingsPanelProps {
  preferences: UserPreferences | null;
  onSavePreferences: (
    input: Omit<UserPreferences, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onExport: () => Promise<BackupPayload>;
  onImport: (payload: BackupPayload) => Promise<void>;
  isValidBackupPayload: (data: unknown) => data is BackupPayload;
  listCheckIns?: () => Promise<CheckInRow[]>;
  restoreCheckIns?: (rows: CheckInRow[]) => Promise<void>;
}

export function SettingsPanel({
  preferences,
  onSavePreferences,
  onExport,
  onImport,
  isValidBackupPayload,
  listCheckIns,
  restoreCheckIns,
}: SettingsPanelProps) {
  const [name, setName] = useState(preferences?.name ?? "");
  const [timezone, setTimezone] = useState(
    preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [theme, setTheme] = useState<"light" | "dark" | "system">(preferences?.theme ?? "system");
  const [reminderEnabled, setReminderEnabled] = useState(preferences?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(preferences?.reminderTime ?? "20:30");
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function saveSettings() {
    await onSavePreferences({
      name: name.trim() || "Jij",
      timezone,
      theme,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
    });
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    document.documentElement.setAttribute("data-theme-preference", theme);
    window.localStorage.setItem("inchecken-theme-preference", theme);
    setStatus("Instellingen opgeslagen.");
  }

  async function requestReminderPermission() {
    if (!("Notification" in window)) {
      setStatus("Meldingen worden niet ondersteund in deze browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setStatus(permission === "granted" ? "Meldingen toegestaan." : "Meldingen geweigerd.");
  }

  async function handleExport() {
    const base = await onExport();
    const checkins =
      listCheckIns != null ? await listCheckIns() : [];
    const payload: BackupPayload = { ...base, checkins };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `inchecken-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Backup geëxporteerd.");
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const payload = JSON.parse(text);
      if (!isValidBackupPayload(payload)) {
        setStatus("Ongeldig backupbestand.");
        return;
      }
      if (restoreCheckIns != null && payload.checkins?.length > 0) {
        await restoreCheckIns(payload.checkins);
      }
      await onImport(payload);
      setStatus("Backup geïmporteerd.");
    } catch {
      setStatus("Backup kon niet worden gelezen.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-[17px] font-semibold text-[var(--text-primary)]">Instellingen</h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">Beheer je profiel en voorkeuren</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Naam"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Naam"
          />
          <Input
            label="Tijdzone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Tijdzone"
          />
        </div>

        <div className="border-t border-[var(--surface-border)] pt-6">
          <p className="text-[13px] font-medium text-[var(--text-primary)] mb-3">Thema</p>
          <ThemeToggle />
        </div>

        <div className="border-t border-[var(--surface-border)] pt-6">
          <p className="text-[13px] font-medium text-[var(--text-primary)] mb-3">Herinneringen</p>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <label className="inline-flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => setReminderEnabled(event.target.checked)}
                className="rounded border-[var(--surface-border)] focus-visible:ring-[var(--focus-ring)]"
              />
              Dagelijkse herinnering
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              disabled={!reminderEnabled}
              className={selectClass}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={requestReminderPermission}
              className="min-h-[44px]"
            >
              Sta meldingen toe
            </Button>
          </div>
        </div>

        <div className="border-t border-[var(--surface-border)] pt-6">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" onClick={saveSettings}>
              Instellingen opslaan
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleExport}>
              Backup exporteren
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Backup importeren
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="hidden"
      />

      {status ? (
        <p
          className={`text-[13px] ${
            /Ongeldig|geweigerd|kon niet|niet ondersteund/i.test(status)
              ? "text-[var(--text-error)]"
              : "text-[var(--text-success)]"
          }`}
        >
          {status}
        </p>
      ) : null}
    </section>
  );
}
