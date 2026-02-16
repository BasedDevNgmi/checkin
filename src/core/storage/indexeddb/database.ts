import type {
  JournalEntry,
  MoodCheckIn,
  UserPreferences,
} from "@/core/storage/models";

const DB_NAME = "mind-journal-db";
const DB_VERSION = 1;

type StoreName = "moodCheckIns" | "journalEntries" | "preferences";

interface MindJournalDbSchema {
  moodCheckIns: MoodCheckIn;
  journalEntries: JournalEntry;
  preferences: UserPreferences;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("moodCheckIns")) {
        db.createObjectStore("moodCheckIns", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("journalEntries")) {
        db.createObjectStore("journalEntries", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("preferences")) {
        db.createObjectStore("preferences", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T extends StoreName, TResult>(
  storeName: T,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => Promise<TResult>
): Promise<TResult> {
  return openDb().then((db) =>
    new Promise<TResult>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      action(store)
        .then(resolve)
        .catch(reject);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    })
  );
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listStore<T extends StoreName>(
  storeName: T
): Promise<MindJournalDbSchema[T][]> {
  return withStore(storeName, "readonly", async (store) => {
    const all = await requestToPromise(store.getAll() as IDBRequest<MindJournalDbSchema[T][]>);
    return all;
  });
}

export async function getStoreItem<T extends StoreName>(
  storeName: T,
  id: string
): Promise<MindJournalDbSchema[T] | null> {
  return withStore(storeName, "readonly", async (store) => {
    const item = await requestToPromise(
      store.get(id) as IDBRequest<MindJournalDbSchema[T] | undefined>
    );
    return item ?? null;
  });
}

export async function putStoreItem<T extends StoreName>(
  storeName: T,
  item: MindJournalDbSchema[T]
): Promise<void> {
  return withStore(storeName, "readwrite", async (store) => {
    await requestToPromise(store.put(item));
  });
}

export async function putStoreItems<T extends StoreName>(
  storeName: T,
  items: MindJournalDbSchema[T][]
): Promise<void> {
  return withStore(storeName, "readwrite", async (store) => {
    for (const item of items) {
      await requestToPromise(store.put(item));
    }
  });
}

export async function deleteStoreItem<T extends StoreName>(
  storeName: T,
  id: string
): Promise<void> {
  return withStore(storeName, "readwrite", async (store) => {
    await requestToPromise(store.delete(id));
  });
}

export async function clearStores(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["moodCheckIns", "journalEntries", "preferences"], "readwrite");
    tx.objectStore("moodCheckIns").clear();
    tx.objectStore("journalEntries").clear();
    tx.objectStore("preferences").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
