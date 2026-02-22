import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReminderScheduler } from "@/features/settings/components/ReminderScheduler";

const getPreferences = vi.fn();

vi.mock("@/core/storage", () => ({
  getRepositoryBundle: () => ({
    preferences: { get: getPreferences },
  }),
}));

describe("ReminderScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: class {
        static permission = "granted";
        constructor() {}
      },
    });
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not trigger reminders when disabled", async () => {
    getPreferences.mockResolvedValue({
      reminderEnabled: false,
      reminderTime: "20:30",
    });
    const spy = vi.spyOn(window, "Notification");
    render(<ReminderScheduler />);
    await vi.runOnlyPendingTimersAsync();
    expect(spy).not.toHaveBeenCalled();
  });
});
