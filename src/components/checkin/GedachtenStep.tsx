"use client";

import { motion } from "framer-motion";

interface GedachtenStepProps {
  value: string;
  onChange: (value: string) => void;
}

const cloudPath =
  "M 24 20 C 20 20 16 24 16 28 C 12 28 8 32 8 36 C 8 42 14 46 22 46 C 28 46 32 42 36 46 C 42 46 48 40 48 34 C 52 34 56 30 56 24 C 56 18 50 14 44 14 C 42 10 38 8 34 8 C 28 8 24 14 24 20 Z";

export function GedachtenStep({ value, onChange }: GedachtenStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Gedachten</h2>
      <div className="w-full max-w-lg mx-auto aspect-[1.3] drop-shadow-md">
        <svg
          viewBox="0 0 64 54"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="cloud-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="100%" stopColor="#fce7f3" />
            </linearGradient>
          </defs>
          <path
            d={cloudPath}
            fill="url(#cloud-bg)"
            stroke="rgba(253, 164, 175, 0.4)"
            strokeWidth="1"
          />
          <foreignObject x="14" y="18" width="36" height="22" className="overflow-visible">
            <div className="h-full w-full flex items-center justify-center p-1">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Wat gaat er door je hoofd?"
                rows={3}
                className="h-full w-full resize-none rounded-xl border border-[var(--surface-border)] bg-[var(--surface-glass-strong)] px-2 py-1 text-center text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                aria-label="Gedachten"
              />
            </div>
          </foreignObject>
        </svg>
      </div>
      <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
        Schrijf kort wat je gedachten zijn
      </p>
    </motion.div>
  );
}
