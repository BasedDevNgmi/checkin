import { describe, expect, it } from "vitest";
import type { CheckInRow } from "@/types/checkin";
import { computeStreaks } from "@/features/analytics/lib/streaks";

function row(day: string): CheckInRow {
  return {
    id: `id-${day}`,
    user_id: "u1",
    created_at: `${day}T10:00:00.000Z`,
    thoughts: null,
    emotions: [],
    body_parts: [],
    energy_level: 50,
    behavior_meta: null,
  };
}

describe("computeStreaks", () => {
  it("returns zero streaks when no check-ins exist", () => {
    expect(computeStreaks([], new Date("2026-02-21T10:00:00.000Z"))).toEqual({
      current: 0,
      longest: 0,
    });
  });

  it("calculates current and longest streak correctly", () => {
    const rows = [row("2026-02-21"), row("2026-02-20"), row("2026-02-18"), row("2026-02-17"), row("2026-02-16")];
    expect(computeStreaks(rows, new Date("2026-02-21T10:00:00.000Z"))).toEqual({
      current: 1,
      longest: 3,
    });
  });
});
