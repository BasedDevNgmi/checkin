"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleRequestCallback = (deadline: IdleDeadline) => void;
type IdleRequestOptions = { timeout?: number };

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function useNavPrefetch(hrefs: readonly string[]) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const idleWindow = window as IdleWindow;

    const prefetchAll = () => {
      if (cancelled) return;
      hrefs.forEach((href) => router.prefetch(href));
    };

    // Idle prefetch keeps navigation snappy without competing with first paint.
    const requestIdle = idleWindow.requestIdleCallback;
    if (typeof requestIdle === "function") {
      const id = requestIdle(prefetchAll, { timeout: 1200 });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(id);
      };
    }

    const timeout = window.setTimeout(prefetchAll, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [hrefs, router]);
}
