"use client";

import type { BodyPartId } from "@/types/checkin";

interface BodyMapSVGProps {
  selectedParts: string[];
  onTogglePart: (id: BodyPartId) => void;
}

const PARTS: { id: BodyPartId; path: string; label: string }[] = [
  { id: "head", path: "M 50 8 A 12 12 0 1 1 50 32 A 12 12 0 1 1 50 8", label: "Hoofd" },
  { id: "neck", path: "M 44 32 L 56 32 L 54 42 L 46 42 Z", label: "Nek" },
  { id: "chest", path: "M 42 42 L 58 42 L 56 58 L 44 58 Z", label: "Borst" },
  { id: "shoulder_left", path: "M 30 40 L 42 38 L 42 46 L 32 48 Z", label: "Linkerschouder" },
  { id: "shoulder_right", path: "M 58 38 L 70 40 L 68 48 L 58 46 Z", label: "Rechterschouder" },
  { id: "arm_left", path: "M 28 48 L 38 48 L 36 72 L 30 72 Z", label: "Linkerarm" },
  { id: "arm_right", path: "M 62 48 L 72 48 L 74 72 L 68 72 Z", label: "Rechterarm" },
  { id: "stomach", path: "M 44 58 L 56 58 L 54 78 L 46 78 Z", label: "Buik" },
  { id: "hip_left", path: "M 38 76 L 48 76 L 48 84 L 40 84 Z", label: "Linkerheup" },
  { id: "hip_right", path: "M 52 76 L 62 76 L 60 84 L 52 84 Z", label: "Rechterheup" },
  { id: "leg_left", path: "M 40 84 L 48 84 L 48 98 L 42 98 Z", label: "Linkerbeen" },
  { id: "leg_right", path: "M 52 84 L 60 84 L 58 98 L 52 98 Z", label: "Rechterbeen" },
];

export function BodyMapSVG({ selectedParts, onTogglePart }: BodyMapSVGProps) {
  return (
    <svg
      viewBox="0 0 100 108"
      className="w-full max-w-[260px] mx-auto touch-none select-none"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Lichaam: tik op een gebied om sensaties te markeren"
    >
      {PARTS.map(({ id, path, label }) => {
        const isSelected = selectedParts.includes(id);
        return (
          <path
            key={id}
            d={path}
            fill={isSelected ? "var(--accent)" : "var(--text-soft)"}
            fillOpacity={isSelected ? 0.35 : 0.15}
            stroke={isSelected ? "var(--accent)" : "var(--text-soft)"}
            strokeOpacity={isSelected ? 0.8 : 0.35}
            strokeWidth={3}
            className="cursor-pointer transition-all duration-200"
            style={{ pointerEvents: "all" }}
            onClick={() => onTogglePart(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTogglePart(id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${label}${isSelected ? ", geselecteerd" : ""}`}
            aria-pressed={isSelected}
          />
        );
      })}
    </svg>
  );
}
