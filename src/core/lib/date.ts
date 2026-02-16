export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function toDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function isWithinRange(
  iso: string,
  startDate: string | null,
  endDate: string | null
): boolean {
  const day = toDayKey(iso);
  if (startDate && day < startDate) return false;
  if (endDate && day > endDate) return false;
  return true;
}
