"use client";

export type AppEventName =
  | "auth_login_success"
  | "auth_signup_success"
  | "auth_magic_link_sent"
  | "onboarding_completed"
  | "checkin_saved"
  | "checkin_updated"
  | "checkin_deleted"
  | "pwa_install_prompt_result"
  | "pwa_install_completed"
  | "pwa_push_permission_denied"
  | "pwa_push_subscribed"
  | "pwa_background_sync_requested";

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
