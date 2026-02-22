import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to dashboard when next is unsafe", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(
      new Request("https://example.com/auth/callback?code=abc&next=//evil.com")
    );
    expect(response.headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("redirects to next path when code exchange succeeds", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(
      new Request("https://example.com/auth/callback?code=abc&next=/profile")
    );
    expect(response.headers.get("location")).toBe("https://example.com/profile");
  });

  it("redirects to auth error when code is missing", async () => {
    const response = await GET(new Request("https://example.com/auth/callback"));
    expect(response.headers.get("location")).toBe("https://example.com/?error=auth");
  });

  it("redirects to auth error when code exchange fails", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: { message: "expired" } });
    const response = await GET(
      new Request("https://example.com/auth/callback?code=abc&next=/profile")
    );
    expect(response.headers.get("location")).toBe("https://example.com/?error=auth");
  });
});
