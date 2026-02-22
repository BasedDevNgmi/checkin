import { toDayKey } from "@/features/analytics/lib/date";

export interface HeatmapCell {
  key: string;
  value: number | undefined;
  row: number;
  col: number;
}

export function buildHeatmapCells(dayData: Map<string, number>, weeks = 16, today = new Date()) {
  const totalDays = weeks * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);
  const startDow = startDate.getDay();
  const offset = startDow === 0 ? 6 : startDow - 1;
  startDate.setDate(startDate.getDate() - offset);

  const cells: HeatmapCell[] = [];
  const date = new Date(startDate);
  let col = 0;

  while (date <= today) {
    const key = toDayKey(date);
    const dow = date.getDay();
    const row = dow === 0 ? 6 : dow - 1;
    cells.push({ key, value: dayData.get(key), row, col: Math.floor(col / 7) });
    date.setDate(date.getDate() + 1);
    col++;
  }

  return cells;
}
