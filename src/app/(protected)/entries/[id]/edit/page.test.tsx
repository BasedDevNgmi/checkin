import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditEntryPage from "@/app/(protected)/entries/[id]/edit/page";

const getCheckIn = vi.fn();
const updateCheckIn = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "id-1" }),
}));

vi.mock("@/lib/CheckinsContext", () => ({
  useCheckinsContext: () => ({ refresh }),
}));

vi.mock("@/lib/checkin", () => ({
  getCheckIn: (...args: unknown[]) => getCheckIn(...args),
  updateCheckIn: (...args: unknown[]) => updateCheckIn(...args),
}));

vi.mock("@/components/checkin/CheckInWizard", () => ({
  CheckInWizard: (props: { onSubmit: (data: { thoughts: string }) => Promise<unknown> }) => (
    <button
      type="button"
      onClick={() => {
        void props.onSubmit({ thoughts: "x" } as never);
      }}
    >
      trigger-submit
    </button>
  ),
}));

describe("EditEntryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows not found state", async () => {
    getCheckIn.mockResolvedValue(null);
    render(<EditEntryPage />);
    await waitFor(() =>
      expect(screen.getByText("Check-in niet gevonden.")).toBeInTheDocument()
    );
  });

  it("loads row and submits update", async () => {
    getCheckIn.mockResolvedValue({
      id: "id-1",
      user_id: "u1",
      created_at: new Date().toISOString(),
      thoughts: "hello",
      emotions: [],
      body_parts: [],
      energy_level: 50,
      behavior_meta: {},
    });
    updateCheckIn.mockResolvedValue({ ok: true });

    render(<EditEntryPage />);
    await waitFor(() => expect(screen.getByText("trigger-submit")).toBeInTheDocument());
    fireEvent.click(screen.getByText("trigger-submit"));
    await waitFor(() => expect(updateCheckIn).toHaveBeenCalled());
  });
});
