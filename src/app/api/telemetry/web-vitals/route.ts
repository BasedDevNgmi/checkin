import { NextResponse } from "next/server";

type WebVitalPayload = {
  name?: string;
  value?: number;
  id?: string;
  rating?: string;
  path?: string;
  ts?: number;
};

const THRESHOLDS: Record<string, number> = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
};

function evaluateSloBreach(metric: WebVitalPayload) {
  if (!metric.name || typeof metric.value !== "number") return false;
  const threshold = THRESHOLDS[metric.name];
  if (typeof threshold !== "number") return false;
  return metric.value > threshold;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebVitalPayload;
    if (process.env.NODE_ENV === "production") {
      const severity = evaluateSloBreach(body) ? "slo_breach" : "ok";
      console.info("[web-vitals]", {
        ...body,
        severity,
      });
    }
  } catch {
    // Ignore malformed payloads to keep telemetry endpoint non-blocking.
  }

  return new NextResponse(null, { status: 204 });
}
