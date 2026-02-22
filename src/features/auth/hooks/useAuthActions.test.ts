import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

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

import { useAuthActions } from "@/features/auth/hooks/useAuthActions";

describe("useAuthActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
});
