import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckinScreen } from "@/features/checkin/components/CheckinScreen";

vi.mock("next/dynamic", () => ({
  default: () => () => <div>wizard-component</div>,
}));

vi.mock("@/lib/CheckinsContext", () => ({
  useCheckinsContext: () => ({ refresh: vi.fn() }),
}));

describe("CheckinScreen", () => {
  it("renders overview link and wizard", () => {
    render(<CheckinScreen />);
    expect(screen.getByRole("link", { name: "Terug naar overzicht" })).toBeInTheDocument();
    expect(screen.getByText("wizard-component")).toBeInTheDocument();
  });
});
