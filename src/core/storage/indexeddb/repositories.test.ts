import { describe, expect, it } from "vitest";
import { validateBackupPayload } from "@/core/storage/indexeddb/repositories";

describe("validateBackupPayload", () => {
  it("accepts valid payload shape", () => {
    expect(
      validateBackupPayload({
        version: 1,
        exportedAt: "2026-02-15T10:00:00.000Z",
        moodCheckIns: [],
        journalEntries: [],
        userPreferences: null,
      })
    ).toBe(true);
  });

  it("rejects unsupported versions", () => {
    expect(
      validateBackupPayload({
        version: 2,
        exportedAt: "2026-02-15T10:00:00.000Z",
        moodCheckIns: [],
        journalEntries: [],
        userPreferences: null,
      })
    ).toBe(false);
  });
});
