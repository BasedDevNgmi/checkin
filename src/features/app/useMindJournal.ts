"use client";

import { useCallback, useEffect, useState } from "react";
import { getRepositoryBundle, validateBackupPayload } from "@/core/storage";
import type { BackupPayload, UserPreferences } from "@/core/storage/models";

export function useMindJournal() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const refresh = useCallback(async () => {
    const repositories = getRepositoryBundle();
    const prefs = await repositories.preferences.get();
    setPreferences(prefs);
  }, []);

  useEffect(() => {
    let active = true;
    const repositories = getRepositoryBundle();
    void repositories.preferences.get().then((prefs) => {
      if (active) setPreferences(prefs);
    });
    return () => {
      active = false;
    };
  }, []);

  const savePreferences = useCallback(
    async (input: Omit<UserPreferences, "id" | "createdAt" | "updatedAt">) => {
      const repositories = getRepositoryBundle();
      await repositories.preferences.save(input);
      await refresh();
    },
    [refresh]
  );

  const exportBackup = useCallback(async () => {
    const repositories = getRepositoryBundle();
    return repositories.backup.exportAll();
  }, []);

  const importBackup = useCallback(
    async (payload: BackupPayload) => {
      const repositories = getRepositoryBundle();
      await repositories.backup.importAll(payload);
      await refresh();
    },
    [refresh]
  );

  return {
    preferences,
    savePreferences,
    exportBackup,
    importBackup,
    validateBackupPayload,
    refresh,
  };
}
