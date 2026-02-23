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

const prefetchedRoutes = new Set<string>();

type NetworkNavigator = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

function canPrefetch() {
  const networkNavigator = navigator as NetworkNavigator;
  const connection = networkNavigator.connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return false;
  return true;
}

export function useNavPrefetch(hrefs: readonly string[]) {
  const router = useRouter();

  useEffect(() => {
    if (!canPrefetch()) return;

    let cancelled = false;
    const idleWindow = window as IdleWindow;
    const uniqueHrefs = hrefs.filter((href) => !prefetchedRoutes.has(href));
    if (uniqueHrefs.length === 0) return;

    const prefetchAll = () => {
      if (cancelled) return;
      uniqueHrefs.forEach((href) => {
        router.prefetch(href);
        prefetchedRoutes.add(href);
      });
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
