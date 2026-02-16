"use client";

import { useRef, useState } from "react";
import type { BackupPayload, UserPreferences } from "@/core/storage/models";
import type { CheckInRow } from "@/types/checkin";

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
    <section className="space-y-6 rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Instellingen en backup</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Naam"
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <input
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          placeholder="Tijdzone"
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </div>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as "light" | "dark" | "system")}
        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm"
      >
        <option value="system">Thema: Systeem</option>
        <option value="light">Thema: Licht</option>
        <option value="dark">Thema: Donker</option>
      </select>
      <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => setReminderEnabled(event.target.checked)}
          />
          Dagelijkse herinnering
        </label>
        <input
          type="time"
          value={reminderTime}
          onChange={(event) => setReminderTime(event.target.value)}
          disabled={!reminderEnabled}
          className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          type="button"
          onClick={requestReminderPermission}
          className="rounded-[14px] border border-[var(--surface-border)] px-3 py-2.5 text-sm min-h-[44px]"
        >
          Sta meldingen toe
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveSettings}
          className="rounded-[14px] bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Instellingen opslaan
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-[14px] border border-[var(--surface-border)] px-4 py-2 text-sm"
        >
          Backup exporteren
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-[14px] border border-[var(--surface-border)] px-4 py-2 text-sm"
        >
          Backup importeren
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="hidden"
      />

      {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
    </section>
  );
}
