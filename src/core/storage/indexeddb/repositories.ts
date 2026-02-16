import type {
  AppRepositoryBundle,
  BackupRepository,
  PreferencesRepository,
} from "@/core/storage/contracts";
import type { BackupPayload, UserPreferences } from "@/core/storage/models";
import {
  clearStores,
  getStoreItem,
  putStoreItem,
} from "@/core/storage/indexeddb/database";

function nowIso(): string {
  return new Date().toISOString();
}

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
      checkins: [],
      userPreferences: await preferencesRepository.get(),
    };
  },
  async importAll(payload) {
    await clearStores();
    if (payload.userPreferences) {
      await putStoreItem("preferences", payload.userPreferences);
    }
  },
};

export const indexedDbRepositoryBundle: AppRepositoryBundle = {
  preferences: preferencesRepository,
  backup: backupRepository,
};
