"use client";

import { motion } from "framer-motion";
import { EMOTION_OPTIONS } from "@/types/checkin";

interface GevoelStepProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function GevoelStep({ selected, onToggle }: GevoelStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Gevoel</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Kies een of meerdere gevoelens die bij je passen
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
        {EMOTION_OPTIONS.map(({ id, label, emoji }) => {
          const isSelected = selected.includes(id);
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-4 px-3 transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--interactive-active)] text-[var(--text-primary)] shadow-[var(--shadow-zen)]"
                  : "border-[var(--surface-border)] bg-[var(--surface-glass-strong)] text-[var(--text-muted)] hover:bg-[var(--interactive-hover)]"
              }`}
              aria-pressed={isSelected}
              aria-label={label}
            >
              <span className="text-2xl" role="img" aria-hidden>
                {emoji}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
