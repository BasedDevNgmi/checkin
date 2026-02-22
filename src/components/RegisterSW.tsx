"use client";

import { useEffect, useState } from "react";
import { isProduction, isServiceWorkerEnabled } from "@/config/flags";

export function RegisterSW() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const unregisterAndClearCaches = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if (!("caches" in window)) return;
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("inchecken-") || key.startsWith("workbox"))
          .map((key) => caches.delete(key))
      );
    };

    if (!isProduction || !isServiceWorkerEnabled) {
      void unregisterAndClearCaches();
      return;
    }

    let isMounted = true;

    const onControllerChange = () => {
      window.location.reload();
    };

    const listenForWaitingServiceWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && isMounted) {
        setWaitingWorker(registration.waiting);
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        listenForWaitingServiceWorker(registration);

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              listenForWaitingServiceWorker(registration);
            }
          });
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-md rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface-elevated)] p-3 shadow-lg">
      <p className="text-sm text-[var(--text-primary)]">
        Er is een nieuwe versie beschikbaar.
      </p>
      <button
        type="button"
        className="mt-2 inline-flex min-h-[40px] items-center justify-center rounded-[var(--radius-control)] bg-[var(--interactive-primary)] px-3 py-2 text-sm font-medium text-[var(--interactive-primary-text)]"
        onClick={() => waitingWorker.postMessage({ type: "SKIP_WAITING" })}
      >
        Nu updaten
      </button>
    </div>
  );
}
