import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mocks.getUser,
    },
  })),
}));

import { updateSession } from "@/lib/supabase/middleware";

describe("updateSession middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_DEV_PREVIEW = "false";
  });

  it("redirects unauthenticated protected requests to root", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("https://example.com/dashboard");
    const response = await updateSession(req);
    expect(response.headers.get("location")).toBe("https://example.com/");
  });

  it("redirects authenticated root requests to dashboard", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const req = new NextRequest("https://example.com/");
    const response = await updateSession(req);
    expect(response.headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("allows public routes for unauthenticated users", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("https://example.com/login");
    const response = await updateSession(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
