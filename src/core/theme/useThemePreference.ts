"use client";

import { useEffect, useState } from "react";
import {
  applyThemePreference,
  persistThemePreference,
  readStoredThemePreference,
  type ThemePreference,
} from "@/core/theme/theme";

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredThemePreference());

  useEffect(() => {
    applyThemePreference(preference);
    persistThemePreference(preference);
  }, [preference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (preference === "system") {
        applyThemePreference("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  return { preference, setPreference };
}
