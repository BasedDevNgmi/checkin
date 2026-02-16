import type { UserPreferences } from "@/core/storage/models";

const DB_NAME = "inchecken-db";
const DB_VERSION = 1;

type StoreName = "preferences";

interface IncheckenDbSchema {
  preferences: UserPreferences;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
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
      const cleanup = () => {
        db.close();
      };
      tx.onerror = () => {
        cleanup();
        reject(tx.error);
      };
      action(store)
        .then((result) => {
          cleanup();
          resolve(result);
        })
        .catch((err) => {
          cleanup();
          reject(err);
        });
    })
  );
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoreItem<T extends StoreName>(
  storeName: T,
  id: string
): Promise<IncheckenDbSchema[T] | null> {
  return withStore(storeName, "readonly", async (store) => {
    const item = await requestToPromise(
      store.get(id) as IDBRequest<IncheckenDbSchema[T] | undefined>
    );
    return item ?? null;
  });
}

export async function putStoreItem<T extends StoreName>(
  storeName: T,
  item: IncheckenDbSchema[T]
): Promise<void> {
  return withStore(storeName, "readwrite", async (store) => {
    await requestToPromise(store.put(item));
  });
}

export async function clearStores(): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["preferences"], "readwrite");
      tx.objectStore("preferences").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
