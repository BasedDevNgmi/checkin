import type {
  BackupPayload,
  JournalEntry,
  MoodCheckIn,
  UserPreferences,
} from "@/core/storage/models";

export interface MoodRepository {
  list(): Promise<MoodCheckIn[]>;
  getById(id: string): Promise<MoodCheckIn | null>;
  create(input: Omit<MoodCheckIn, "id" | "createdAt" | "updatedAt">): Promise<MoodCheckIn>;
  update(
    id: string,
    patch: Partial<Omit<MoodCheckIn, "id" | "createdAt" | "updatedAt">>
  ): Promise<MoodCheckIn | null>;
  remove(id: string): Promise<boolean>;
}

export interface JournalRepository {
  list(): Promise<JournalEntry[]>;
  getById(id: string): Promise<JournalEntry | null>;
  create(input: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">): Promise<JournalEntry>;
  update(
    id: string,
    patch: Partial<Omit<JournalEntry, "id" | "createdAt" | "updatedAt">>
  ): Promise<JournalEntry | null>;
  remove(id: string): Promise<boolean>;
}

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
  mood: MoodRepository;
  journal: JournalRepository;
  preferences: PreferencesRepository;
  backup: BackupRepository;
}
