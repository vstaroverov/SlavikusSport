const DB_NAME = "slavikus-sport";
const STORE_NAME = "app-data";
const KEY_PREFIX = "slavikus:";

let dbPromise;

export async function initializePersistentStorage() {
  if (!("indexedDB" in window)) return;

  const db = await openDatabase();
  const indexedEntries = await readAllEntries(db);
  const localKeys = getLocalDataKeys();
  const localKeySet = new Set(localKeys);

  indexedEntries.forEach(([key, value]) => {
    if (!localKeySet.has(key)) localStorage.setItem(key, value);
  });

  await Promise.all(getLocalDataKeys().map((key) => writeEntry(db, key, localStorage.getItem(key) || "")));

  patchLocalStorage(db);
}

export async function exportBackup() {
  const db = await openDatabase();
  const indexedEntries = await readAllEntries(db);
  const data = Object.fromEntries(indexedEntries);

  getLocalDataKeys().forEach((key) => {
    data[key] = localStorage.getItem(key) || "";
  });

  return {
    app: "Slavikus Sport",
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
}

export async function importBackup(backup) {
  if (!backup?.data || typeof backup.data !== "object") {
    throw new Error("Некорректный файл резервной копии");
  }

  const db = await openDatabase();
  await clearStore(db);

  const writes = Object.entries(backup.data).map(([key, value]) => {
    if (!key.startsWith(KEY_PREFIX)) return Promise.resolve();
    localStorage.setItem(key, String(value));
    return writeEntry(db, key, String(value));
  });

  await Promise.all(writes);
}

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function patchLocalStorage(db) {
  if (localStorage.__slavikusPersistentPatched) return;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = (key, value) => {
    originalSetItem(key, value);
    if (String(key).startsWith(KEY_PREFIX)) writeEntry(db, key, String(value));
  };

  localStorage.removeItem = (key) => {
    originalRemoveItem(key);
    if (String(key).startsWith(KEY_PREFIX)) deleteEntry(db, key);
  };

  Object.defineProperty(localStorage, "__slavikusPersistentPatched", {
    value: true,
    configurable: false
  });
}

function getLocalDataKeys() {
  return Object.keys(localStorage).filter((key) => key.startsWith(KEY_PREFIX));
}

function readAllEntries(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const keys = request.result;
      Promise.all(keys.map((key) => readEntry(db, key))).then((values) => {
        resolve(keys.map((key, index) => [key, values[index]]));
      });
    };
    request.onerror = () => reject(request.error);
  });
}

function readEntry(db, key) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function writeEntry(db, key, value) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteEntry(db, key) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearStore(db) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
