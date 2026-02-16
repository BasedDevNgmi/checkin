import { createClient } from "@/lib/supabase/client";
import type { CheckInFormState } from "@/types/checkin";

const DB_NAME = "inchecken-offline";
const STORE = "pending_checkins";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
  });
}

export interface PendingCheckIn {
  id?: number;
  payload: CheckInFormState;
  createdAt: number;
}

export async function addPendingCheckIn(payload: CheckInFormState): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const record: Omit<PendingCheckIn, "id"> = {
      payload,
      createdAt: Date.now(),
    };
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function removePendingCheckIn(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function syncPendingCheckIns(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingCheckIns();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { synced: 0, failed: pending.length };

  let synced = 0;
  let failed = 0;
  for (const item of pending) {
    const id = item.id as number;
    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      thoughts: item.payload.thoughts || null,
      emotions: item.payload.emotions,
      body_parts: item.payload.bodyParts,
      energy_level: item.payload.energyLevel,
      behavior_meta: item.payload.behaviorMeta,
    });
    if (error) {
      failed++;
      continue;
    }
    await removePendingCheckIn(id);
    synced++;
  }
  return { synced, failed };
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
