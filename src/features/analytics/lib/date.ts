export function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  // Keep day boundaries in UTC to match toDayKey().
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}
