import { createClient } from "@/lib/supabase/client";
import type { CheckInFormState, CheckInRow, SaveResult } from "@/types/checkin";
import {
  isOnline,
  addPendingCheckIn,
  syncPendingCheckIns,
} from "./offline";

export type { SaveResult };

/** List checkins for the current user (Supabase). */
export async function listCheckIns(): Promise<CheckInRow[]> {
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

/** Get a single check-in by id (Supabase). */
export async function getCheckIn(id: string): Promise<CheckInRow | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !data) return null;
  return data as CheckInRow;
}

export async function saveCheckIn(data: CheckInFormState): Promise<SaveResult> {
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

/** Update an existing check-in by id. */
export async function updateCheckIn(
  id: string,
  data: CheckInFormState
): Promise<SaveResult> {
  if (!isOnline()) {
    return { ok: false, error: "Offline; wijzigingen later opslaan." };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };
  const { error } = await supabase
    .from("checkins")
    .update({
      thoughts: data.thoughts || null,
      emotions: data.emotions,
      body_parts: data.bodyParts,
      energy_level: data.energyLevel,
      behavior_meta: data.behaviorMeta,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Delete a check-in by id. */
export async function deleteCheckIn(id: string): Promise<SaveResult> {
  if (!isOnline()) {
    return { ok: false, error: "Offline; verwijderen wanneer je weer online bent." };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };
  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function syncCheckIns(): Promise<{ synced: number; failed: number }> {
  return syncPendingCheckIns();
}

/** Restore check-ins (e.g. after backup import) into Supabase. */
export async function restoreCheckIns(rows: CheckInRow[]): Promise<void> {
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
