"use client";

import { useMindJournal } from "@/features/app/useMindJournal";
import { SettingsPanel } from "@/features/settings/components/SettingsPanel";
import { SignOutButton } from "@/components/SignOutButton";
import { listCheckIns, restoreCheckIns, isLocalStorageMode } from "@/lib/checkin";

export function ProfileScreen() {
  const {
    preferences,
    savePreferences,
    exportBackup,
    importBackup,
    validateBackupPayload,
  } = useMindJournal();

  return (
    <div className="py-4 pb-24 space-y-6">
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
        {isLocalStorageMode() ? (
          <p className="text-sm text-[var(--text-muted)]">
            Local storage mode – geen account. Je gegevens staan alleen op dit apparaat.
          </p>
        ) : (
          <SignOutButton />
        )}
      </section>
    </div>
  );
}
