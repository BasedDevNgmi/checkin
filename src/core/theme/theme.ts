export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "inchecken-theme-preference";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function resolveThemePreference(preference: ThemePreference, isDarkSystem: boolean): ResolvedTheme {
  if (preference === "system") {
    return isDarkSystem ? "dark" : "light";
  }
  return preference;
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : "system";
}

export function applyThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") return;
  const resolved = resolveThemePreference(preference, getSystemPrefersDark());
  document.documentElement.setAttribute("data-theme-preference", preference);
  document.documentElement.setAttribute("data-theme", resolved);
}

export function persistThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function readThemePreferenceFromDom(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const attr = document.documentElement.getAttribute("data-theme-preference");
  return isThemePreference(attr) ? attr : readStoredThemePreference();
}

export const themeInitScript = `
(() => {
  try {
    const key = "${THEME_STORAGE_KEY}";
    const stored = window.localStorage.getItem(key);
    const preference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = preference === "system" ? (isDark ? "dark" : "light") : preference;
    document.documentElement.setAttribute("data-theme-preference", preference);
    document.documentElement.setAttribute("data-theme", resolved);
  } catch {
    document.documentElement.setAttribute("data-theme-preference", "system");
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;
