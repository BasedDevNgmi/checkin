"use client";

export type AppEventName =
  | "auth_login_success"
  | "auth_signup_success"
  | "auth_magic_link_sent"
  | "onboarding_completed"
  | "checkin_saved"
  | "checkin_updated"
  | "checkin_deleted";

export function trackEvent(name: AppEventName, payload: Record<string, unknown> = {}) {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const body = JSON.stringify({
    name,
    payload,
    path: window.location.pathname,
    ts: Date.now(),
  });
  navigator.sendBeacon("/api/telemetry/events", body);
}
