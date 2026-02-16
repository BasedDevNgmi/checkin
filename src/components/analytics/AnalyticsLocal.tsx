"use client";

import { useEffect, useState } from "react";
import type { CheckInRow } from "@/types/checkin";
import { getCheckInsLocal } from "@/lib/checkin-local";
import { AnalyticsView } from "./AnalyticsView";

export function AnalyticsLocal() {
  const [rows, setRows] = useState<CheckInRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckInsLocal()
      .then((data) => setRows(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-4 text-sm text-slate-500">Laden…</p>;
  }

  return <AnalyticsView checkins={rows} />;
}
