export const radii = {
  lg: "14px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "28px",
} as const;

export const motion = {
  fast: 120,
  base: 180,
  smooth: 220,
} as const;

export const accent = {
  default: "var(--accent)",
  soft: "var(--accent-soft)",
} as const;

export const moodPalette = {
  low: "#7e83c9",
  neutral: "var(--accent-soft)",
  high: "var(--accent)",
} as const;
