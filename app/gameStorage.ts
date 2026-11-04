export type StoredFile = { path: string; blob: Blob };

const DB_NAME = "gamessite";
const STORE = "session";
const KEY = "game";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export function saveGame(files: StoredFile[]) {
  return run("readwrite", (store) => store.put(files, KEY));
}

export async function loadGame(): Promise<StoredFile[]> {
  return ((await run("readonly", (store) => store.get(KEY))) as StoredFile[] | undefined) ?? [];
}
