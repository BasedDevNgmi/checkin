"use client";

import { useCallback, useEffect, useState } from "react";
import type { CheckInRow } from "@/types/checkin";
import { listCheckIns } from "./checkin";

export function useCheckins(initialCheckins?: CheckInRow[] | null) {
  const [checkins, setCheckins] = useState<CheckInRow[]>(initialCheckins ?? []);
  const [loading, setLoading] = useState(initialCheckins == null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listCheckIns();
      setCheckins(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCheckins != null) {
      setCheckins(initialCheckins);
      setLoading(false);
    } else {
      refresh();
    }
  }, [initialCheckins, refresh]);

  return { checkins, loading, refresh };
}
