"use client";

import { motion, useReducedMotion } from "framer-motion";

interface BodyPartStat {
  part: string;
  count: number;
}

interface BodyPartBarsProps {
  data: BodyPartStat[];
}

const LABEL_MAP: Record<string, string> = {
  hoofd: "Hoofd",
  nek: "Nek",
  schouders: "Schouders",
  borst: "Borst",
  buik: "Buik",
  rug: "Rug",
  armen: "Armen",
  handen: "Handen",
  benen: "Benen",
  voeten: "Voeten",
};

function humanize(raw: string): string {
  return LABEL_MAP[raw] ?? raw.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function BodyPartBars({ data }: BodyPartBarsProps) {
  const reducedMotion = useReducedMotion();
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) return null;

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Lichaam</h3>
      <p className="mt-1 text-xs text-[var(--text-soft)]">Meest genoemde lichaamsdelen</p>
      <div className="mt-4 space-y-2.5">
        {data.map((d) => (
          <div key={d.part} className="flex items-center gap-3">
            <span className="w-20 text-[13px] text-[var(--text-primary)] shrink-0 truncate">{humanize(d.part)}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--interactive-hover)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
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

export type { BodyPartStat };
