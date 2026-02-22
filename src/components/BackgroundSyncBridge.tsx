"use client";

import { useEffect } from "react";
import { flushQueuedCheckins } from "@/lib/checkin";
import { trackEvent } from "@/core/telemetry/events";

export function BackgroundSyncBridge() {
  useEffect(() => {
    let active = true;

    const flushNow = async (trigger: "online" | "service_worker_ready" | "sync_event") => {
      const result = await flushQueuedCheckins();
      if (active && result.processed > 0) {
        trackEvent("checkin_saved", {
          mode: "background_sync_flush",
          trigger,
          processed: result.processed,
          remaining: result.remaining,
        });
      }
    };

    const handleOnline = () => {
      void flushNow("online");
    };

    const handleMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "FLUSH_CHECKIN_QUEUE") {
        void flushNow("sync_event");
      }
    };

    if (navigator.onLine) {
      void flushNow("service_worker_ready");
    }

    window.addEventListener("online", handleOnline);
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
