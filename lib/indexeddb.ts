const DB_NAME = 'EtfPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'etf_store';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB is not available on the server'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function executeRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setItem(key: string, value: unknown): Promise<void> {
  if (typeof window === 'undefined') return;
  await executeRequest('readwrite', (store) => store.put(value, key));
}

export async function getItem<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  const result = await executeRequest<T>('readonly', (store) => store.get(key));
  return result !== undefined ? result : null;
}

export async function removeItem(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await executeRequest('readwrite', (store) => store.delete(key));
}
