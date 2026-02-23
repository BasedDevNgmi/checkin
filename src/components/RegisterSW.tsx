"use client";

import { useEffect, useRef, useState } from "react";
import { isProduction, isServiceWorkerEnabled } from "@/config/flags";
import { Button } from "@/components/ui/Button";

export function RegisterSW() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const allowReloadRef = useRef(false);

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
      if (!allowReloadRef.current) return;
      window.location.reload();
    };

    const listenForWaitingServiceWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && isMounted) {
        setWaitingWorker(registration.waiting);
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const registerServiceWorker = () =>
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

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    const scheduleRegistration = () => {
      if (typeof idleWindow.requestIdleCallback === "function") {
        idleId = idleWindow.requestIdleCallback(() => {
          void registerServiceWorker();
        }, { timeout: 1200 });
        return;
      }
      idleId = window.setTimeout(() => {
        void registerServiceWorker();
      }, 300);
    };

    if (document.readyState === "complete") {
      scheduleRegistration();
    } else {
      window.addEventListener("load", scheduleRegistration, { once: true });
    }

    return () => {
      isMounted = false;
      if (idleId != null) {
        if (typeof idleWindow.cancelIdleCallback === "function") {
          idleWindow.cancelIdleCallback(idleId);
        } else {
          window.clearTimeout(idleId);
        }
      }
      window.removeEventListener("load", scheduleRegistration);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="surface-card fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-md rounded-[var(--radius-card)] p-3">
      <p className="text-sm leading-relaxed text-[var(--text-primary)]">
        Er is een nieuwe versie beschikbaar.
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-3"
        onClick={() => {
          allowReloadRef.current = true;
          waitingWorker.postMessage({ type: "SKIP_WAITING" });
        }}
      >
        Nu updaten
      </Button>
    </div>
  );
}
