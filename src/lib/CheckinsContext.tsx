"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CheckInRow } from "@/types/checkin";
import { useCheckins } from "./useCheckins";

type CheckinsContextValue = {
  checkins: CheckInRow[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const CheckinsContext = createContext<CheckinsContextValue | null>(null);

export function CheckinsProvider({
  children,
  initialCheckins,
}: {
  children: ReactNode;
  initialCheckins?: CheckInRow[] | null;
}) {
  const value = useCheckins(initialCheckins);
  return (
    <CheckinsContext.Provider value={value}>{children}</CheckinsContext.Provider>
  );
}

export function useCheckinsContext(): CheckinsContextValue {
  const ctx = useContext(CheckinsContext);
  if (ctx == null) {
    throw new Error("useCheckinsContext must be used within CheckinsProvider");
  }
  return ctx;
}
