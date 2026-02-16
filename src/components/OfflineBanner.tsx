"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { syncCheckIns, isLocalStorageMode } from "@/lib/checkin";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      void syncCheckIns();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isLocalStorageMode() || isOnline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 bg-amber-100 text-amber-900 py-2 px-4 text-sm font-medium"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      Je bent offline. Check-ins worden lokaal opgeslagen en later gesynchroniseerd.
    </div>
  );
}
