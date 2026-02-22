"use client";

import type { CheckInFormState } from "@/types/checkin";

const QUEUE_KEY = "inchecken-sync-queue-v1";

export type CheckinSyncOperation =
  | { id: string; type: "save"; payload: CheckInFormState; createdAt: number }
  | { id: string; type: "update"; targetId: string; payload: CheckInFormState; createdAt: number }
  | { id: string; type: "delete"; targetId: string; createdAt: number };

type QueueOperationInput =
  | { type: "save"; payload: CheckInFormState }
  | { type: "update"; targetId: string; payload: CheckInFormState }
  | { type: "delete"; targetId: string };

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readQueue(): CheckinSyncOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CheckinSyncOperation[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: CheckinSyncOperation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function queueOperation(operation: QueueOperationInput) {
  const queue = readQueue();
  queue.push({ ...operation, id: randomId(), createdAt: Date.now() } as CheckinSyncOperation);
  writeQueue(queue);
}

export function getQueueLength() {
  return readQueue().length;
}

export async function requestBackgroundSync() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) {
      const syncRegistration = registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      };
      await syncRegistration.sync.register("checkin-sync");
    }
  } catch {
    // Best effort: queue still flushes on next online event.
  }
}

export async function flushQueue(processor: (operation: CheckinSyncOperation) => Promise<boolean>) {
  const queue = readQueue();
  if (queue.length === 0) return { processed: 0, remaining: 0 };

  const remaining: CheckinSyncOperation[] = [];
  let processed = 0;
  for (const item of queue) {
    const ok = await processor(item);
    if (ok) {
      processed += 1;
      continue;
    }
    remaining.push(item);
  }
  writeQueue(remaining);
  return { processed, remaining: remaining.length };
}
