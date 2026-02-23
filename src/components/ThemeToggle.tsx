"use client";

import { motion } from "framer-motion";
import { EASE_SMOOTH, MOTION_DURATION } from "@/lib/motion";
import { Laptop, Moon, Sun } from "lucide-react";
import { useThemePreference } from "@/core/theme/useThemePreference";
import type { ThemePreference } from "@/core/theme/theme";

const OPTIONS: Array<{
  id: ThemePreference;
  label: string;
  Icon: typeof Sun;
}> = [
  { id: "light", label: "Licht", Icon: Sun },
  { id: "dark", label: "Donker", Icon: Moon },
  { id: "system", label: "Systeem", Icon: Laptop },
];

interface ThemeToggleProps {
  value?: ThemePreference;
  onChange?: (value: ThemePreference) => void;
}

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const theme = useThemePreference();
  const preference = value ?? theme.preference;
  const setPreference = onChange ?? theme.setPreference;

  const activeIndex = OPTIONS.findIndex((o) => o.id === preference);

  return (
    <div
      className="relative inline-flex w-full min-w-[108px] max-w-[140px] items-stretch rounded-[var(--radius-control)] border border-[var(--surface-border)] bg-[var(--surface)] p-0.5"
      role="group"
      aria-label="Thema kiezen"
    >
      <motion.div
        className="absolute top-0.5 bottom-0.5 w-[calc((100%-4px)/3)] rounded-[var(--radius-small)] bg-[var(--interactive-active)]"
        style={{ left: "2px" }}
        transition={{ duration: MOTION_DURATION.base, ease: EASE_SMOOTH }}
        initial={false}
        animate={{
          x: `calc(${activeIndex * 100}% + ${activeIndex * 2}px)`,
        }}
        aria-hidden
      />
      {OPTIONS.map(({ id, label, Icon }) => {
        const isActive = preference === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setPreference(id)}
            className="relative z-10 flex min-h-[36px] flex-1 items-center justify-center rounded-[var(--radius-small)] p-1.5 transition-colors duration-[var(--motion-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            aria-pressed={isActive}
            aria-label={`Thema: ${label}`}
            title={label}
          >
            <span
              className={`flex items-center justify-center transition-colors duration-[var(--motion-base)] ${
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-soft)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
          </button>
        );
      })}
    </div>
  );
}
