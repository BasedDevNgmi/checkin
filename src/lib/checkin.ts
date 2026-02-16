import { createClient } from "@/lib/supabase/client";
import type { CheckInFormState, CheckInRow } from "@/types/checkin";
import {
  isOnline,
  addPendingCheckIn,
  syncPendingCheckIns,
} from "./offline";
import {
  saveCheckInLocal,
  getCheckInsLocal,
  setCheckInsLocal,
} from "./checkin-local";
import { isLocalStorageMode as isLocalStorageModeFromStorage } from "./storage-mode";

export type SaveResult =
  | { ok: true }
  | { ok: false; offline: true }
  | { ok: false; error: string };

export const isLocalStorageMode = isLocalStorageModeFromStorage;

/** List checkins for the current user. Uses Supabase when authenticated, else local storage. */
export async function listCheckIns(): Promise<CheckInRow[]> {
  if (typeof window !== "undefined" && isLocalStorageMode()) {
    return getCheckInsLocal();
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as CheckInRow[];
}

export async function saveCheckIn(data: CheckInFormState): Promise<SaveResult> {
  if (typeof window !== "undefined" && isLocalStorageMode()) {
    return saveCheckInLocal(data);
  }

  if (!isOnline()) {
    await addPendingCheckIn(data);
    return { ok: false, offline: true };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    thoughts: data.thoughts || null,
    emotions: data.emotions,
    body_parts: data.bodyParts,
    energy_level: data.energyLevel,
    behavior_meta: data.behaviorMeta,
  });

  if (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await addPendingCheckIn(data);
      return { ok: false, offline: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function syncCheckIns(): Promise<{ synced: number; failed: number }> {
  return syncPendingCheckIns();
}

/** Restore check-ins (e.g. after backup import). Local: replaces storage. Supabase: upserts with current user. */
export async function restoreCheckIns(rows: CheckInRow[]): Promise<void> {
  if (typeof window !== "undefined" && isLocalStorageMode()) {
    setCheckInsLocal(rows);
    return;
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || rows.length === 0) return;
  const toUpsert = rows.map((r) => ({
    id: r.id,
    user_id: user.id,
    created_at: r.created_at,
    thoughts: r.thoughts,
    emotions: r.emotions ?? [],
    body_parts: r.body_parts ?? [],
    energy_level: r.energy_level,
    behavior_meta: r.behavior_meta ?? {},
  }));
  await supabase.from("checkins").upsert(toUpsert, { onConflict: "id" });
}
