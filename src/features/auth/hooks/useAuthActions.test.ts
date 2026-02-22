import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

const trackEvent = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: authMocks.signInWithPassword,
      signUp: authMocks.signUp,
      signInWithOtp: authMocks.signInWithOtp,
      resetPasswordForEmail: authMocks.resetPasswordForEmail,
    },
  }),
}));

vi.mock("@/core/telemetry/events", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

describe("useAuthActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trackEvent.mockReset();
  });

  it("returns error message when password login fails", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: { message: "Bad creds" } });
    const { result } = renderHook(() => useAuthActions());

    let response: Awaited<ReturnType<typeof result.current.loginWithPassword>> | undefined;
    await act(async () => {
      response = await result.current.loginWithPassword("a@b.com", "wrong");
    });

    expect(response).toEqual({ ok: false, message: "Bad creds" });
  });

  it("returns session info on sign-up success", async () => {
    authMocks.signUp.mockResolvedValue({ data: { session: { access_token: "x" } }, error: null });
    const { result } = renderHook(() => useAuthActions());

    let response: Awaited<ReturnType<typeof result.current.signUp>> | undefined;
    await act(async () => {
      response = await result.current.signUp("a@b.com", "secret123");
    });

    expect(response).toEqual({ ok: true, hasSession: true });
    expect(trackEvent).toHaveBeenCalledWith("auth_signup_success", {
      confirmationRequired: false,
    });
  });

  it("returns message when sign-up requires confirmation", async () => {
    authMocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    const { result } = renderHook(() => useAuthActions());

    let response: Awaited<ReturnType<typeof result.current.signUp>> | undefined;
    await act(async () => {
      response = await result.current.signUp("a@b.com", "secret123");
    });

    expect(response).toEqual(
      expect.objectContaining({ ok: true, hasSession: false })
    );
    expect(trackEvent).toHaveBeenCalledWith("auth_signup_success", {
      confirmationRequired: true,
    });
  });

  it("returns success message when magic link is sent", async () => {
    authMocks.signInWithOtp.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuthActions());

    let response: Awaited<ReturnType<typeof result.current.sendMagicLink>> | undefined;
    await act(async () => {
      response = await result.current.sendMagicLink("a@b.com");
    });

    expect(response).toEqual(
      expect.objectContaining({ ok: true, message: expect.stringContaining("magic link") })
    );
    expect(trackEvent).toHaveBeenCalledWith("auth_magic_link_sent");
  });

  it("returns success message when password reset email is sent", async () => {
    authMocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuthActions());

    let response: Awaited<ReturnType<typeof result.current.sendPasswordReset>> | undefined;
    await act(async () => {
      response = await result.current.sendPasswordReset("a@b.com");
    });

    expect(response).toEqual(
      expect.objectContaining({ ok: true, message: expect.stringContaining("wachtwoord") })
    );
  });

  it("updates loading state around async actions", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      await result.current.loginWithPassword("a@b.com", "secret123");
    });
    expect(result.current.loadingAction).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
