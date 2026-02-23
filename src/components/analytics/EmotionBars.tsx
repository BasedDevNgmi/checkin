"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EMOTION_OPTIONS } from "@/types/checkin";

const EMOJI_MAP: Map<string, string> = new Map(EMOTION_OPTIONS.map((e) => [e.id, e.emoji]));

interface EmotionStat {
  emotion: string;
  count: number;
  avgEnergy: number;
}

interface EmotionBarsProps {
  data: EmotionStat[];
}

function energyColor(avg: number): string {
  if (avg >= 70) return "var(--text-success)";
  if (avg >= 40) return "var(--accent)";
  return "var(--text-error)";
}

export function EmotionBars({ data }: EmotionBarsProps) {
  const reducedMotion = useReducedMotion();
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Emoties</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Frequentie &amp; gemiddelde energie</p>
      <div className="mt-4 space-y-3">
        {data.map((d) => (
          <div key={d.emotion} className="flex items-center gap-3">
            <span className="flex w-20 items-center gap-1.5 text-[13px] text-[var(--text-primary)] shrink-0">
              {EMOJI_MAP.get(d.emotion) && <span aria-hidden>{EMOJI_MAP.get(d.emotion)}</span>}
              <span className="truncate">{d.emotion}</span>
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--interactive-hover)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: energyColor(d.avgEnergy) }}
                initial={reducedMotion ? { width: `${(d.count / max) * 100}%` } : { width: 0 }}
                animate={{ width: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <span className="text-[12px] tabular-nums text-[var(--text-soft)] w-8 text-right shrink-0">{d.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { EmotionStat };
