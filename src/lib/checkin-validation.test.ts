import { describe, expect, it } from "vitest";
import { sanitizeCheckInPayload } from "@/lib/checkin-validation";

describe("sanitizeCheckInPayload", () => {
  it("keeps only allowed emotions and body parts", () => {
    const sanitized = sanitizeCheckInPayload({
      thoughts: " test ",
      emotions: ["Blij", "INVALID", "Blij"],
      bodyParts: ["head", "wrong", "head"],
      energyLevel: 42,
      behaviorMeta: {},
    });

    expect(sanitized.emotions).toEqual(["Blij"]);
    expect(sanitized.bodyParts).toEqual(["head"]);
    expect(sanitized.thoughts).toBe("test");
  });

  it("clamps and rounds energy level", () => {
    const sanitized = sanitizeCheckInPayload({
      thoughts: "",
      emotions: [],
      bodyParts: [],
      energyLevel: 142.4,
      behaviorMeta: {},
    });
    expect(sanitized.energyLevel).toBe(100);
  });
});
