"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

interface EnergieStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function EnergieStep({ value, onChange }: EnergieStepProps) {
  const motionValue = useMotionValue(value);
  const heightPercent = useTransform(motionValue, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    onChange(v);
    motionValue.set(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Energie</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Hoeveel energie heb je nu? (0–100%)
      </p>
      <div className="flex flex-col items-center gap-6">
        <div
          className="relative h-52 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--surface-border)] bg-[var(--surface-glass-strong)]"
          style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-violet-500 to-violet-400 transition-shadow"
            style={{
              height: heightPercent,
              boxShadow: "0 -2px 12px rgba(139, 92, 246, 0.3)",
            }}
          />
        </div>
        <div className="w-full max-w-xs">
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={handleInput}
            className="w-full h-3 accent-violet-500 cursor-pointer"
            aria-label="Energie niveau 0 tot 100 procent"
          />
        </div>
        <p className="text-lg font-semibold text-[#8ea0ff]">{value}%</p>
      </div>
    </motion.div>
  );
}
