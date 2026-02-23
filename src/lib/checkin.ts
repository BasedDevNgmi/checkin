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

type CheckinEventName = "checkin_saved" | "checkin_updated" | "checkin_deleted";

type DirectCheckinOperation =
  | { type: "save"; payload: CheckInFormState }
  | { type: "update"; targetId: string; payload: CheckInFormState }
  | { type: "delete"; targetId: string };

const isBrowser = typeof window !== "undefined";
let flushInFlight: Promise<{ processed: number; remaining: number }> | null = null;

function shouldRetryQueuedError(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  if (
    normalized.includes("not logged") ||
    normalized.includes("niet ingelogd") ||
    normalized.includes("permission") ||
    normalized.includes("forbidden") ||
    normalized.includes("unauthorized") ||
    normalized.includes("jwt") ||
    normalized.includes("invalid") ||
    normalized.includes("violat")
  ) {
    return false;
  }
  return true;
}

function toDbPayload(payload: CheckInFormState) {
  const sanitized = sanitizeCheckInPayload(payload);
  return {
    thoughts: sanitized.thoughts || null,
    emotions: sanitized.emotions,
    body_parts: sanitized.bodyParts,
    energy_level: sanitized.energyLevel,
    behavior_meta: sanitized.behaviorMeta,
  };
}

async function executeOperation(
  userId: string,
  operation: DirectCheckinOperation
): Promise<string | null> {
  const supabase = createClient();

  if (operation.type === "save") {
    const { error } = await supabase
      .from("checkins")
      .insert({ user_id: userId, ...toDbPayload(operation.payload) });
    return error?.message ?? null;
  }

  if (operation.type === "update") {
    const { error } = await supabase
      .from("checkins")
      .update(toDbPayload(operation.payload))
      .eq("id", operation.targetId)
      .eq("user_id", userId);
    return error?.message ?? null;
  }

  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("id", operation.targetId)
    .eq("user_id", userId);
  return error?.message ?? null;
}

function toQueuedOperation(operation: DirectCheckinOperation) {
  if (operation.type === "save") {
    return { type: "save", payload: operation.payload } as const;
  }
  if (operation.type === "update") {
    return { type: "update", targetId: operation.targetId, payload: operation.payload } as const;
  }
  return { type: "delete", targetId: operation.targetId } as const;
}

async function queueAndTrack(
  operation: DirectCheckinOperation,
  eventName: CheckinEventName,
  mode: "queued_offline" | "queued_retry"
): Promise<SaveResult> {
  queueOperation(toQueuedOperation(operation));
  await requestBackgroundSync();
  trackEvent(eventName, { mode, queueLength: getQueueLength() });
  return { ok: true };
}

async function runWithOfflineFallback(
  operation: DirectCheckinOperation,
  eventName: CheckinEventName
): Promise<SaveResult> {
  if (isBrowser && !window.navigator.onLine) {
    return queueAndTrack(operation, eventName, "queued_offline");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Niet ingelogd" };

  const errorMessage = await executeOperation(user.id, operation);
  if (errorMessage) {
    if (isBrowser && shouldRetryQueuedError(errorMessage)) {
      return queueAndTrack(operation, eventName, "queued_retry");
    }
    return { ok: false, error: errorMessage };
  }

  trackEvent(eventName);
  return { ok: true };
}

export async function saveCheckIn(data: CheckInFormState): Promise<SaveResult> {
  return runWithOfflineFallback({ type: "save", payload: data }, "checkin_saved");
}

/** Update an existing check-in by id. */
export async function updateCheckIn(id: string, data: CheckInFormState): Promise<SaveResult> {
  return runWithOfflineFallback(
    { type: "update", targetId: id, payload: data },
    "checkin_updated"
  );
}

/** Delete a check-in by id. */
export async function deleteCheckIn(id: string): Promise<SaveResult> {
  return runWithOfflineFallback({ type: "delete", targetId: id }, "checkin_deleted");
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
  const errorMessage = await executeOperation(user.id, operation);
  if (errorMessage == null) return true;
  // Drop permanent errors so the queue can make forward progress.
  return !shouldRetryQueuedError(errorMessage);
}

export async function flushQueuedCheckins() {
  if (flushInFlight) return flushInFlight;
  flushInFlight = (async () => {
    const result = await flushQueue(processQueuedOperation);
    if (result.processed > 0) {
      trackEvent("checkin_saved", {
        mode: "queue_flushed",
        processed: result.processed,
        remaining: result.remaining,
      });
    }
    return result;
  })();

  try {
    return await flushInFlight;
  } finally {
    flushInFlight = null;
  }
}
