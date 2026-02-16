import { describe, expect, it } from "vitest";
import { buildInsightSummary } from "@/core/lib/insights";
import type { JournalEntry, MoodCheckIn } from "@/core/storage/models";

describe("buildInsightSummary", () => {
  it("computes averages and streak correctly", () => {
    const moods: MoodCheckIn[] = [
      {
        id: "m1",
        createdAt: "2026-02-15T10:00:00.000Z",
        updatedAt: "2026-02-15T10:00:00.000Z",
        valence: 8,
        energy: 7,
        emotions: ["Calm"],
        note: "",
      },
      {
        id: "m2",
        createdAt: "2026-02-14T10:00:00.000Z",
        updatedAt: "2026-02-14T10:00:00.000Z",
        valence: 4,
        energy: 5,
        emotions: ["Anxious"],
        note: "",
      },
    ];

    const entries: JournalEntry[] = [
      {
        id: "j1",
        createdAt: "2026-02-15T11:00:00.000Z",
        updatedAt: "2026-02-15T11:00:00.000Z",
        title: "Good day",
        body: "Body",
        tags: ["focus"],
        moodLinkId: "m1",
        context: {
          sleepHours: null,
          stressLevel: null,
          socialBattery: null,
          triggers: [],
          gratitude: "",
          intention: "",
        },
      },
      {
        id: "j2",
        createdAt: "2026-02-14T11:00:00.000Z",
        updatedAt: "2026-02-14T11:00:00.000Z",
        title: "Rough day",
        body: "Body",
        tags: ["work"],
        moodLinkId: "m2",
        context: {
          sleepHours: null,
          stressLevel: null,
          socialBattery: null,
          triggers: [],
          gratitude: "",
          intention: "",
        },
      },
    ];

    const summary = buildInsightSummary(moods, entries);
    expect(summary.currentStreak).toBe(2);
    expect(summary.averageValence).toBe(6);
    expect(summary.averageEnergy).toBe(6);
    expect(summary.topHighMoodTags).toContain("focus");
    expect(summary.topLowMoodTags).toContain("work");
  });
});
