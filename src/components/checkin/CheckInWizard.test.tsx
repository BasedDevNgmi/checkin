import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckInWizard } from "@/components/checkin/CheckInWizard";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("CheckInWizard", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps primary action visible and advances steps", () => {
    render(<CheckInWizard onSubmit={vi.fn(async () => ({ ok: true }))} />);
    const primary = screen.getAllByRole("button", { name: "Volgende" }).at(-1);
    expect(primary).toBeDefined();
    fireEvent.click(primary!);
    expect(screen.getByText("2 van 5")).toBeInTheDocument();
  });

  it("submits on last step", async () => {
    const onSubmit = vi.fn(async () => ({ ok: true as const }));
    render(<CheckInWizard onSubmit={onSubmit} />);

    for (let i = 0; i < 4; i += 1) {
      const nextButton = screen.getAllByRole("button", { name: "Volgende" }).at(-1);
      expect(nextButton).toBeDefined();
      fireEvent.click(nextButton!);
    }

    const finishButton = screen.getAllByRole("button", { name: "Afronden" }).at(-1);
    expect(finishButton).toBeDefined();
    fireEvent.click(finishButton!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
