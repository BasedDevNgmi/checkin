import { createClient } from "@/lib/supabase/client";
import { sanitizeCheckInPayload } from "@/lib/checkin-validation";
import { trackEvent } from "@/core/telemetry/events";
import type { CheckInFormState, CheckInRow, SaveResult } from "@/types/checkin";
import {
  flushQueue,
  getQueueLength,
  queueOperation,
  requestBackgroundSync,
  type CheckinSyncOperation,
} from "@/lib/offline-sync";

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
    .select("id,user_id,created_at,thoughts,emotions,body_parts,energy_level,behavior_meta")
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
    .select("id,user_id,created_at,thoughts,emotions,body_parts,energy_level,behavior_meta")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !data) return null;
  return data as CheckInRow;
}

export async function saveCheckIn(data: CheckInFormState): Promise<SaveResult> {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    queueOperation({ type: "save", payload: data });
    await requestBackgroundSync();
    trackEvent("checkin_saved", { mode: "queued_offline", queueLength: getQueueLength() });
    return { ok: true };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };
  const payload = sanitizeCheckInPayload(data);

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    thoughts: payload.thoughts || null,
    emotions: payload.emotions,
    body_parts: payload.bodyParts,
    energy_level: payload.energyLevel,
    behavior_meta: payload.behaviorMeta,
  });

  if (error) {
    if (typeof window !== "undefined") {
      queueOperation({ type: "save", payload: data });
      await requestBackgroundSync();
      trackEvent("checkin_saved", { mode: "queued_retry", queueLength: getQueueLength() });
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  trackEvent("checkin_saved");
  return { ok: true };
}

/** Update an existing check-in by id. */
export async function updateCheckIn(
  id: string,
  data: CheckInFormState
): Promise<SaveResult> {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    queueOperation({ type: "update", targetId: id, payload: data });
    await requestBackgroundSync();
    trackEvent("checkin_updated", { mode: "queued_offline", queueLength: getQueueLength() });
    return { ok: true };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };
  const payload = sanitizeCheckInPayload(data);
  const { error } = await supabase
    .from("checkins")
    .update({
      thoughts: payload.thoughts || null,
      emotions: payload.emotions,
      body_parts: payload.bodyParts,
      energy_level: payload.energyLevel,
      behavior_meta: payload.behaviorMeta,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    if (typeof window !== "undefined") {
      queueOperation({ type: "update", targetId: id, payload: data });
      await requestBackgroundSync();
      trackEvent("checkin_updated", { mode: "queued_retry", queueLength: getQueueLength() });
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  trackEvent("checkin_updated");
  return { ok: true };
}

/** Delete a check-in by id. */
export async function deleteCheckIn(id: string): Promise<SaveResult> {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    queueOperation({ type: "delete", targetId: id });
    await requestBackgroundSync();
    trackEvent("checkin_deleted", { mode: "queued_offline", queueLength: getQueueLength() });
    return { ok: true };
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
  if (error) {
    if (typeof window !== "undefined") {
      queueOperation({ type: "delete", targetId: id });
      await requestBackgroundSync();
      trackEvent("checkin_deleted", { mode: "queued_retry", queueLength: getQueueLength() });
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }
  trackEvent("checkin_deleted");
  return { ok: true };
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

async function processQueuedOperation(operation: CheckinSyncOperation) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (operation.type === "save") {
    const payload = sanitizeCheckInPayload(operation.payload);
    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      thoughts: payload.thoughts || null,
      emotions: payload.emotions,
      body_parts: payload.bodyParts,
      energy_level: payload.energyLevel,
      behavior_meta: payload.behaviorMeta,
    });
    return !error;
  }

  if (operation.type === "update") {
    const payload = sanitizeCheckInPayload(operation.payload);
    const { error } = await supabase
      .from("checkins")
      .update({
        thoughts: payload.thoughts || null,
        emotions: payload.emotions,
        body_parts: payload.bodyParts,
        energy_level: payload.energyLevel,
        behavior_meta: payload.behaviorMeta,
      })
      .eq("id", operation.targetId)
      .eq("user_id", user.id);
    return !error;
  }

  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("id", operation.targetId)
    .eq("user_id", user.id);
  return !error;
}

export async function flushQueuedCheckins() {
  const result = await flushQueue(processQueuedOperation);
  if (result.processed > 0) {
    trackEvent("checkin_saved", {
      mode: "queue_flushed",
      processed: result.processed,
      remaining: result.remaining,
    });
  }
  return result;
}
