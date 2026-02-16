"use client";

import { useCallback, useEffect, useState } from "react";
import type { CheckInRow } from "@/types/checkin";
import { listCheckIns, syncCheckIns } from "./checkin";

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
    const { synced } = await syncCheckIns();
    if (synced > 0) {
      const rows = await listCheckIns();
      setCheckins(rows);
    }
  }, []);

  useEffect(() => {
    if (initialCheckins != null) {
      setCheckins(initialCheckins);
      setLoading(false);
      syncCheckIns().then(({ synced }) => {
        if (synced > 0) {
          listCheckIns().then(setCheckins);
        }
      });
    } else {
      refresh();
    }
  }, [initialCheckins, refresh]);

  return { checkins, loading, refresh };
}
