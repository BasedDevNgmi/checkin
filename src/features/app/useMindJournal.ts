"use client";

import { useCallback, useEffect, useState } from "react";
import { getRepositoryBundle } from "@/core/storage";
import type {
  BackupPayload,
  JournalEntry,
  MoodCheckIn,
  MoodValue,
  UserPreferences,
} from "@/core/storage/models";
import { validateBackupPayload } from "@/core/storage/indexeddb/repositories";

interface MoodInput {
  valence: MoodValue;
  energy: MoodValue;
  emotions: string[];
  note: string;
}

interface JournalInput {
  title: string;
  body: string;
  tags: string[];
  moodLinkId: string | null;
  context: JournalEntry["context"];
}

export function useMindJournal() {
  const [moodCheckIns, setMoodCheckIns] = useState<MoodCheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const refresh = useCallback(async () => {
    const repositories = getRepositoryBundle();
    const [mood, journal, prefs] = await Promise.all([
      repositories.mood.list(),
      repositories.journal.list(),
      repositories.preferences.get(),
    ]);
    setMoodCheckIns(mood);
    setJournalEntries(journal);
    setPreferences(prefs);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const saveMood = useCallback(
    async (input: MoodInput) => {
      const repositories = getRepositoryBundle();
      const created = await repositories.mood.create(input);
      await refresh();
      return created;
    },
    [refresh]
  );

  const saveJournalEntry = useCallback(
    async (input: JournalInput) => {
      const repositories = getRepositoryBundle();
      const created = await repositories.journal.create(input);
      await refresh();
      return created;
    },
    [refresh]
  );

  const updateJournalEntry = useCallback(
    async (id: string, patch: Partial<JournalInput>) => {
      const repositories = getRepositoryBundle();
      await repositories.journal.update(id, patch);
      await refresh();
    },
    [refresh]
  );

  const removeJournalEntry = useCallback(
    async (id: string) => {
      const repositories = getRepositoryBundle();
      await repositories.journal.remove(id);
      await refresh();
    },
    [refresh]
  );

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
    moodCheckIns,
    journalEntries,
    preferences,
    saveMood,
    saveJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
    savePreferences,
    exportBackup,
    importBackup,
    validateBackupPayload,
    refresh,
  };
}
