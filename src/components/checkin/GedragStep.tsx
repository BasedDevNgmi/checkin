"use client";

import { motion } from "framer-motion";
import type { BewustAutonoom } from "@/types/checkin";

interface GedragStepProps {
  bewustAutonoom: BewustAutonoom | undefined;
  waardenCheck: boolean | undefined;
  onBewustAutonoom: (v: BewustAutonoom) => void;
  onWaardenCheck: (v: boolean) => void;
}

export function GedragStep({
  bewustAutonoom,
  waardenCheck,
  onBewustAutonoom,
  onWaardenCheck,
}: GedragStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-8"
    >
      <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Gedrag</h2>

      <div>
        <p className="mb-3 text-sm font-medium text-[var(--text-muted)]">Bewust / Autonoom</p>
        <div className="flex gap-2">
          {(["Bewust", "Autonoom"] as const).map((opt) => {
            const isSelected = bewustAutonoom === opt;
            return (
              <motion.button
                key={opt}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onBewustAutonoom(opt)}
                className={`flex-1 rounded-xl border-2 py-3 px-4 font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 ${
                  isSelected
                    ? "border-violet-500 bg-violet-100/80 text-violet-900 dark:bg-violet-300/20 dark:text-violet-100"
                    : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]"
                }`}
                aria-pressed={isSelected}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-[var(--text-muted)]">Waarden-check</p>
        <div className="flex gap-2">
          {([true, false] as const).map((opt) => {
            const label = opt ? "Ja" : "Nee";
            const isSelected = waardenCheck === opt;
            return (
              <motion.button
                key={label}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onWaardenCheck(opt)}
                className={`flex-1 rounded-xl border-2 py-3 px-4 font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 ${
                  isSelected
                    ? "border-violet-500 bg-violet-100/80 text-violet-900 dark:bg-violet-300/20 dark:text-violet-100"
                    : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]"
                }`}
                aria-pressed={isSelected}
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
