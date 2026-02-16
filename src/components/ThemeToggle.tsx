"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "inchecken-theme-preference";

const OPTIONS: {
  id: ThemePreference;
  label: string;
  Icon: typeof Sun;
}[] = [
  { id: "light", label: "Licht", Icon: Sun },
  { id: "dark", label: "Donker", Icon: Moon },
  { id: "system", label: "Systeem", Icon: Laptop },
];

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.setAttribute("data-theme-preference", preference);
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  useEffect(() => {
    applyTheme(preference);
    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (preference === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  function handleSetPreference(nextPreference: ThemePreference) {
    setPreference(nextPreference);
  }

  return (
    <div
      className="inline-flex items-center rounded-[14px] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-1"
      role="group"
      aria-label="Thema kiezen"
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const isActive = preference === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleSetPreference(id)}
            className={`inline-flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-[var(--interactive-active)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
            }`}
            aria-pressed={isActive}
            aria-label={`Thema: ${label}`}
            title={`Thema: ${label}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
