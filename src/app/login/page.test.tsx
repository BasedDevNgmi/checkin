import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
const hookMocks = vi.hoisted(() => ({
  loginWithPassword: vi.fn(),
  signUp: vi.fn(),
  sendMagicLink: vi.fn(),
  sendPasswordReset: vi.fn(),
}));

let errorQuery: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => ({
    get: (key: string) => (key === "error" ? errorQuery : null),
  }),
}));

vi.mock("@/features/auth/hooks/useAuthActions", () => ({
  useAuthActions: () => ({
    loadingAction: null,
    isLoading: false,
    loginWithPassword: hookMocks.loginWithPassword,
    signUp: hookMocks.signUp,
    sendMagicLink: hookMocks.sendMagicLink,
    sendPasswordReset: hookMocks.sendPasswordReset,
  }),
}));

vi.mock("@/features/auth/components/AuthCardShell", () => ({
  AuthCardShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/auth/components/LoginPanel", () => ({
  LoginPanel: (props: {
    message: { text: string } | null;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmitPasswordLogin: (event: React.FormEvent) => void;
  }) => (
    <form onSubmit={props.onSubmitPasswordLogin}>
      {props.message ? <p>{props.message.text}</p> : null}
      <input aria-label="email" onChange={(e) => props.onEmailChange(e.target.value)} />
      <input aria-label="password" onChange={(e) => props.onPasswordChange(e.target.value)} />
      <button type="submit">submit-login</button>
    </form>
  ),
}));

vi.mock("@/features/auth/components/ForgotPasswordPanel", () => ({
  ForgotPasswordPanel: () => <div>forgot-panel</div>,
}));

import LoginPage from "@/app/login/page";

describe("login page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    errorQuery = null;
  });

  it("shows auth error from query params", () => {
    errorQuery = "auth";
    render(<LoginPage />);
    expect(
      screen.getByText("Inloggen mislukt of link verlopen. Probeer opnieuw.")
    ).toBeInTheDocument();
  });

  it("submits password login and redirects on success", async () => {
    hookMocks.loginWithPassword.mockResolvedValue({ ok: true });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByText("submit-login"));

    expect(hookMocks.loginWithPassword).toHaveBeenCalledWith("a@b.com", "secret123");
  });
});
