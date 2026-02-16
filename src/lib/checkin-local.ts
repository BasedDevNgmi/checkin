import type { CheckInFormState, CheckInRow } from "@/types/checkin";

const STORAGE_KEY = "inchecken_checkins";
const LOCAL_USER_ID = "local-user";

export type SaveResult =
  | { ok: true }
  | { ok: false; offline: true }
  | { ok: false; error: string };

function getStorage(): CheckInRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckInRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStorage(rows: CheckInRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

/** Replace all local check-ins (e.g. after backup import). */
export function setCheckInsLocal(rows: CheckInRow[]): void {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  setStorage(sorted);
}

export function getCheckInsLocal(): Promise<CheckInRow[]> {
  const rows = getStorage();
  rows.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return Promise.resolve(rows);
}

export function getCheckInByIdLocal(id: string): Promise<CheckInRow | null> {
  const rows = getStorage();
  const found = rows.find((r) => r.id === id) ?? null;
  return Promise.resolve(found);
}

export function saveCheckInLocal(data: CheckInFormState): Promise<SaveResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false, error: "Niet in browser" });
  }
  const rows = getStorage();
  const row: CheckInRow = {
    id: crypto.randomUUID(),
    user_id: LOCAL_USER_ID,
    created_at: new Date().toISOString(),
    thoughts: data.thoughts || null,
    emotions: data.emotions,
    body_parts: data.bodyParts,
    energy_level: data.energyLevel,
    behavior_meta: data.behaviorMeta,
  };
  rows.unshift(row);
  setStorage(rows);
  return Promise.resolve({ ok: true });
}
