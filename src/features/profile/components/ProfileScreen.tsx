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
    <div className="space-y-10 py-6 pb-24 sm:py-8">
      <SettingsPanel
        preferences={preferences}
        onSavePreferences={savePreferences}
        onExport={exportBackup}
        onImport={importBackup}
        isValidBackupPayload={validateBackupPayload}
        listCheckIns={listCheckIns}
        restoreCheckIns={restoreCheckIns}
      />
      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-[17px] font-semibold text-[var(--text-primary)] mb-4">
          Account
        </h2>
        <SignOutButton />
      </section>
    </div>
  );
}
