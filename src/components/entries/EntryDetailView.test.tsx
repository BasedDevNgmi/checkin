import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntryDetailView } from "@/components/entries/EntryDetailView";

const push = vi.fn();
const refresh = vi.fn();
const deleteCheckIn = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/checkin", () => ({
  deleteCheckIn: (...args: unknown[]) => deleteCheckIn(...args),
}));

const checkin = {
  id: "c1",
  user_id: "u1",
  created_at: new Date().toISOString(),
  thoughts: "test",
  emotions: ["Blij"],
  body_parts: [],
  energy_level: 70,
  behavior_meta: null,
};

describe("EntryDetailView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows delete confirmation and handles success", async () => {
    deleteCheckIn.mockResolvedValue({ ok: true });
    render(<EntryDetailView checkin={checkin} />);
    fireEvent.click(screen.getByRole("button", { name: /^Verwijderen$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Verwijderen$/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows delete error on failure", async () => {
    deleteCheckIn.mockResolvedValue({ ok: false, error: "kapot" });
    render(<EntryDetailView checkin={checkin} />);
    fireEvent.click(screen.getByRole("button", { name: /^Verwijderen$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Verwijderen$/i }));
    await waitFor(() => expect(screen.getByText("kapot")).toBeInTheDocument());
  });
});
