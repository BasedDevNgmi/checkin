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
  checkins: import("@/types/checkin").CheckInRow[];
  userPreferences: UserPreferences | null;
}
