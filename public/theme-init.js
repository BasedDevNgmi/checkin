(() => {
  try {
    const key = "inchecken-theme-preference";
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
