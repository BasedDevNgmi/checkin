"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { trackEvent } from "@/core/telemetry/events";
import { requestBackgroundSync } from "@/lib/offline-sync";
import { isPwaExperimentsEnabled, vapidPublicKey } from "@/config/flags";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function base64ToUint8Array(base64: string) {
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const raw = window.atob(padded);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function PwaControls() {
  const enabled = isPwaExperimentsEnabled;
  const publicKey = vapidPublicKey;
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredInstallPrompt);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      setStatus("App is geinstalleerd.");
      trackEvent("pwa_install_completed");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [enabled]);

  if (!enabled) return null;

  const canInstall = !isStandalone && installPrompt != null;

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    trackEvent("pwa_install_prompt_result", { outcome: choice.outcome });
    setStatus(choice.outcome === "accepted" ? "Installatie gestart." : "Installatie geannuleerd.");
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const handleEnablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("Push wordt niet ondersteund op dit apparaat.");
      return;
    }
    if (!publicKey) {
      setStatus("VAPID sleutel ontbreekt. Stel NEXT_PUBLIC_VAPID_PUBLIC_KEY in.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("Meldingen zijn niet toegestaan.");
      trackEvent("pwa_push_permission_denied");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey),
    });
    setStatus("Push is geactiveerd op dit apparaat.");
    trackEvent("pwa_push_subscribed");
  };

  const handleRequestSync = async () => {
    await requestBackgroundSync();
    setStatus("Achtergrond-sync aangevraagd.");
    trackEvent("pwa_background_sync_requested");
  };

  return (
    <div className="border-t border-[var(--surface-border)] pt-6">
      <p className="mb-3 text-[13px] font-medium text-[var(--text-primary)]">PWA functies (beta)</p>
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {canInstall ? (
          <Button type="button" variant="secondary" size="sm" onClick={handleInstall} className="w-full sm:w-auto">
            Installeer app
          </Button>
        ) : null}
        <Button type="button" variant="secondary" size="sm" onClick={handleEnablePush} className="w-full sm:w-auto">
          Push inschakelen
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={handleRequestSync} className="w-full sm:w-auto">
          Sync nu voorbereiden
        </Button>
      </div>
      {status ? (
        <div className="mt-3">
          <FormMessage tone={/niet|ontbreekt|geweigerd|niet toegestaan/i.test(status) ? "error" : "success"}>
            {status}
          </FormMessage>
        </div>
      ) : null}
    </div>
  );
}
