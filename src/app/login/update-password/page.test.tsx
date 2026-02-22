import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mocks.getUser,
      updateUser: mocks.updateUser,
    },
  }),
}));

vi.mock("@/features/auth/components/AuthCardShell", () => ({
  AuthCardShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import UpdatePasswordPage from "@/app/login/update-password/page";

describe("update password page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = "";
  });

  it("shows invalid link message when no recovery session is present", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    render(<UpdatePasswordPage />);
    await waitFor(() =>
      expect(
        screen.getByText("Deze link is ongeldig of verlopen. Vraag een nieuwe resetlink aan.")
      ).toBeInTheDocument()
    );
  });

  it("submits new password and redirects on success", async () => {
    window.location.hash = "#type=recovery";
    mocks.updateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordPage />);

    fireEvent.change(screen.getByLabelText("Wachtwoord"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Wachtwoord bevestigen"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByText("Wachtwoord opslaan"));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({ password: "secret123" });
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });
});
