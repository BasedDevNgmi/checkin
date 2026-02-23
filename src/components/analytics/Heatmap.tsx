"use client";

import { buildHeatmapCells } from "@/features/analytics/lib/heatmap";

interface HeatmapProps {
  dayData: Map<string, number>;
  weeks?: number;
}

function getColor(value: number | undefined): string {
  if (value === undefined) return "var(--interactive-hover)";
  if (value >= 75) return "var(--text-success)";
  if (value >= 50) return "var(--accent)";
  if (value >= 25) return "#d9a038";
  return "var(--text-error)";
}

function getOpacity(value: number | undefined): number {
  if (value === undefined) return 0.3;
  return 0.6 + (value / 100) * 0.4;
}

export function Heatmap({ dayData, weeks = 16 }: HeatmapProps) {
  const cells = buildHeatmapCells(dayData, weeks);

  const maxCol = cells.length > 0 ? Math.max(...cells.map((c) => c.col)) : 0;
  const cellSize = 12;
  const gap = 2;
  const dayLabelWidth = 18;
  const svgWidth = dayLabelWidth + (maxCol + 1) * (cellSize + gap);
  const svgHeight = 7 * (cellSize + gap);
  const dayLabels = ["Ma", "", "Wo", "", "Vr", "", ""];

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Activiteit</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Check-in heatmap</p>
      <div className="mt-4 overflow-x-auto pb-1">
        <svg width={svgWidth} height={svgHeight} aria-label="Check-in heatmap">
          {dayLabels.map((label, i) =>
            label ? (
              <text
                key={i}
                x={0}
                y={i * (cellSize + gap) + cellSize - 1}
                fontSize={9}
                fill="var(--text-soft)"
                dominantBaseline="auto"
              >
                {label}
              </text>
            ) : null
          )}
          {cells.map((c) => (
            <rect
              key={c.key}
              x={dayLabelWidth + c.col * (cellSize + gap)}
              y={c.row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2.5}
              fill={getColor(c.value)}
              opacity={getOpacity(c.value)}
            >
              <title>{c.key}: {c.value !== undefined ? `${c.value}%` : "Geen data"}</title>
            </rect>
          ))}
        </svg>
      </div>
    </div>
  );
}
