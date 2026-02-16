import type { BackupPayload } from "@/core/storage/models";

export function validateBackupPayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<BackupPayload>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.checkins) &&
    (candidate.userPreferences === null ||
      (typeof candidate.userPreferences === "object" &&
        candidate.userPreferences !== null))
  );
}
