"use client";

import { useMindJournal } from "@/features/app/useMindJournal";
import { SettingsPanel } from "@/features/settings/components/SettingsPanel";
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
    <div className="py-4 pb-24">
      <SettingsPanel
        preferences={preferences}
        onSavePreferences={savePreferences}
        onExport={exportBackup}
        onImport={importBackup}
        isValidBackupPayload={validateBackupPayload}
        listCheckIns={listCheckIns}
        restoreCheckIns={restoreCheckIns}
      />
    </div>
  );
}
