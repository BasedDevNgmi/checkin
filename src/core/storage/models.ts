export type MoodValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface MoodCheckIn {
  id: string;
  createdAt: string;
  updatedAt: string;
  valence: MoodValue;
  energy: MoodValue;
  emotions: string[];
  note: string;
}

export interface JournalContext {
  sleepHours: number | null;
  stressLevel: MoodValue | null;
  socialBattery: MoodValue | null;
  triggers: string[];
  gratitude: string;
  intention: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string;
  tags: string[];
  moodLinkId: string | null;
  context: JournalContext;
}

export interface UserPreferences {
  id: "local-preferences";
  name: string;
  timezone: string;
  reminderTime: string | null;
  reminderEnabled: boolean;
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  moodCheckIns: MoodCheckIn[];
  journalEntries: JournalEntry[];
  userPreferences: UserPreferences | null;
}
