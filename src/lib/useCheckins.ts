"use client";

import { useCallback, useEffect, useState } from "react";
import type { CheckInRow } from "@/types/checkin";
import { listCheckIns, syncCheckIns } from "./checkin";

export function useCheckins() {
  const [checkins, setCheckins] = useState<CheckInRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await syncCheckIns();
      const rows = await listCheckIns();
      setCheckins(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { checkins, loading, refresh };
}
