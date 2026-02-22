import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (process.env.NODE_ENV === "production") {
      console.info("[event]", body);
    }
  } catch {
    // Keep this endpoint resilient by accepting malformed requests.
  }

  return new NextResponse(null, { status: 204 });
}
