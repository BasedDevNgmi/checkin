import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (process.env.NODE_ENV === "production") {
      console.info("[web-vitals]", body);
    }
  } catch {
    // Ignore malformed payloads to keep telemetry endpoint non-blocking.
  }

  return new NextResponse(null, { status: 204 });
}
