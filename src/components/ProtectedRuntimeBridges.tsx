"use client";

import { useEffect, useState } from "react";
import { ReminderScheduler } from "@/features/settings/components/ReminderScheduler";
import { BackgroundSyncBridge } from "@/components/BackgroundSyncBridge";

type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleRequestCallback = (deadline: IdleDeadline) => void;
type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function ProtectedRuntimeBridges() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    const enable = () => setEnabled(true);
    const requestIdle = idleWindow.requestIdleCallback;
    if (typeof requestIdle === "function") {
      const id = requestIdle(enable, { timeout: 1500 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(enable, 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <ReminderScheduler />
      <BackgroundSyncBridge />
    </>
  );
}
