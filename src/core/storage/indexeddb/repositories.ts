import type {
  AppRepositoryBundle,
  BackupRepository,
  JournalRepository,
  MoodRepository,
  PreferencesRepository,
} from "@/core/storage/contracts";
import type {
  BackupPayload,
  JournalEntry,
  MoodCheckIn,
  UserPreferences,
} from "@/core/storage/models";
import {
  clearStores,
  deleteStoreItem,
  getStoreItem,
  listStore,
  putStoreItem,
  putStoreItems,
} from "@/core/storage/indexeddb/database";

function nowIso(): string {
  return new Date().toISOString();
}

function byNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

const moodRepository: MoodRepository = {
  async list() {
    const rows = await listStore("moodCheckIns");
    return rows.sort(byNewest);
  },
  async getById(id) {
    return getStoreItem("moodCheckIns", id);
  },
  async create(input) {
    const row: MoodCheckIn = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...input,
    };
    await putStoreItem("moodCheckIns", row);
    return row;
  },
  async update(id, patch) {
    const existing = await getStoreItem("moodCheckIns", id);
    if (!existing) return null;
    const updated: MoodCheckIn = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };
    await putStoreItem("moodCheckIns", updated);
    return updated;
  },
  async remove(id) {
    const existing = await getStoreItem("moodCheckIns", id);
    if (!existing) return false;
    await deleteStoreItem("moodCheckIns", id);
    return true;
  },
};

const journalRepository: JournalRepository = {
  async list() {
    const rows = await listStore("journalEntries");
    return rows.sort(byNewest);
  },
  async getById(id) {
    return getStoreItem("journalEntries", id);
  },
  async create(input) {
    const row: JournalEntry = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...input,
    };
    await putStoreItem("journalEntries", row);
    return row;
  },
  async update(id, patch) {
    const existing = await getStoreItem("journalEntries", id);
    if (!existing) return null;
    const updated: JournalEntry = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };
    await putStoreItem("journalEntries", updated);
    return updated;
  },
  async remove(id) {
    const existing = await getStoreItem("journalEntries", id);
    if (!existing) return false;
    await deleteStoreItem("journalEntries", id);
    return true;
  },
};

const preferencesRepository: PreferencesRepository = {
  async get() {
    return getStoreItem("preferences", "local-preferences");
  },
  async save(input) {
    const existing = await getStoreItem("preferences", "local-preferences");
    const timestamp = nowIso();
    const row: UserPreferences = {
      id: "local-preferences",
      name: input.name,
      timezone: input.timezone,
      reminderEnabled: input.reminderEnabled,
      reminderTime: input.reminderTime,
      theme: input.theme,
      createdAt: existing?.createdAt ?? input.createdAt ?? timestamp,
      updatedAt: input.updatedAt ?? timestamp,
    };
    await putStoreItem("preferences", row);
    return row;
  },
};

const backupRepository: BackupRepository = {
  async exportAll() {
    return {
      version: 1,
      exportedAt: nowIso(),
      moodCheckIns: await moodRepository.list(),
      journalEntries: await journalRepository.list(),
      userPreferences: await preferencesRepository.get(),
    };
  },
  async importAll(payload) {
    await clearStores();
    await putStoreItems("moodCheckIns", payload.moodCheckIns);
    await putStoreItems("journalEntries", payload.journalEntries);
    if (payload.userPreferences) {
      await putStoreItem("preferences", payload.userPreferences);
    }
  },
};

export const indexedDbRepositoryBundle: AppRepositoryBundle = {
  mood: moodRepository,
  journal: journalRepository,
  preferences: preferencesRepository,
  backup: backupRepository,
};

export function validateBackupPayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<BackupPayload>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.moodCheckIns) &&
    Array.isArray(candidate.journalEntries)
  );
}
