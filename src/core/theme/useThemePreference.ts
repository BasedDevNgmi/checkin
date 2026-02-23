"use client";

import { useEffect, useState } from "react";
import {
  applyThemePreference,
  persistThemePreference,
  readStoredThemePreference,
  THEME_MEDIA_QUERY,
  type ThemePreference,
} from "@/core/theme/theme";

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredThemePreference());

  useEffect(() => {
    applyThemePreference(preference);
    persistThemePreference(preference);
  }, [preference]);

  useEffect(() => {
    const media = window.matchMedia(THEME_MEDIA_QUERY);
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
