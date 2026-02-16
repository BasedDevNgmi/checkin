import type { BackupPayload, UserPreferences } from "@/core/storage/models";

export interface PreferencesRepository {
  get(): Promise<UserPreferences | null>;
  save(
    input: Omit<UserPreferences, "id" | "createdAt" | "updatedAt"> &
      Partial<Pick<UserPreferences, "createdAt" | "updatedAt">>
  ): Promise<UserPreferences>;
}

export interface BackupRepository {
  exportAll(): Promise<BackupPayload>;
  importAll(payload: BackupPayload): Promise<void>;
}

export interface AppRepositoryBundle {
  preferences: PreferencesRepository;
  backup: BackupRepository;
}
