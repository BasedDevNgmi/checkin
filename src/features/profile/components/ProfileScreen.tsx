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
    <div className="space-y-8 py-6 pb-28 sm:py-8 md:pb-10">
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
        <div className="glass-card rounded-[var(--radius-card)] p-4">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
