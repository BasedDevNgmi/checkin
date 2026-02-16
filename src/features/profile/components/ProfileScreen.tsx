"use client";

import { useMindJournal } from "@/features/app/useMindJournal";
import { SettingsPanel } from "@/features/settings/components/SettingsPanel";
import { SignOutButton } from "@/components/SignOutButton";
import { listCheckIns, restoreCheckIns } from "@/lib/checkin";

export function ProfileScreen() {
  const {
    preferences,
    savePreferences,
    exportBackup,
    importBackup,
    validateBackupPayload,
  } = useMindJournal();

  return (
    <div className="space-y-6 py-5 pb-24 sm:py-6">
      <SettingsPanel
        preferences={preferences}
        onSavePreferences={savePreferences}
        onExport={exportBackup}
        onImport={importBackup}
        isValidBackupPayload={validateBackupPayload}
        listCheckIns={listCheckIns}
        restoreCheckIns={restoreCheckIns}
      />
      <section
        className="rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-zen)] backdrop-blur-xl"
        aria-labelledby="account-heading"
      >
        <h2 id="account-heading" className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Account
        </h2>
        <SignOutButton />
      </section>
    </div>
  );
}
