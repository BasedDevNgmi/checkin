"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [showBanner, setShowBanner] = useState<boolean | null>(null);

  useEffect(() => {
    setShowBanner(!navigator.onLine);

    const handleOnline = () => setShowBanner(false);
    const handleOffline = () => setShowBanner(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (showBanner !== true) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-[var(--surface-border)] bg-[var(--surface)] py-2 px-4 text-[13px] font-medium text-[var(--text-primary)]"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      Je bent offline. Check-ins worden opgeslagen zodra je weer verbinding hebt.
    </div>
  );
}
