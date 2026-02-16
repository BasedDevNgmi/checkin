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
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setPreference(stored);
    }
  }, []);

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
      className="inline-flex items-center rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] p-0.5"
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
            className={`inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-[10px] p-1.5 transition ${
              isActive
                ? "bg-[var(--interactive-active)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]"
            }`}
            aria-pressed={isActive}
            aria-label={`Thema: ${label}`}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
