"use client";

import { motion } from "framer-motion";
import type { BodyPartId } from "@/types/checkin";
import { BodyMapSVG } from "./BodyMapSVG";

interface LichaamStepProps {
  selectedParts: string[];
  onTogglePart: (id: BodyPartId) => void;
}

export function LichaamStep({ selectedParts, onTogglePart }: LichaamStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">Lichaam</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Tik op de plekken waar je iets voelt
      </p>
      <div className="flex justify-center py-4">
        <BodyMapSVG selectedParts={selectedParts} onTogglePart={onTogglePart} />
      </div>
    </motion.div>
  );
}
