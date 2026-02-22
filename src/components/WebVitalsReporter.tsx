"use client";

import { useReportWebVitals } from "next/web-vitals";

type Metric = {
  name: string;
  value: number;
  id: string;
  rating?: string;
};

export function WebVitalsReporter() {
  useReportWebVitals((metric: Metric) => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !navigator.sendBeacon) return;

    const payload = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      path: window.location.pathname,
      ts: Date.now(),
    });

    navigator.sendBeacon("/api/telemetry/web-vitals", payload);
  });

  return null;
}
