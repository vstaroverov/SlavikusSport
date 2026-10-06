import { cleanZeroLogEntries } from "../log/logCleanup.js";

const DB_NAME = "slavikus-sport";
const STORE_NAME = "app-data";
const KEY_PREFIX = "slavikus:";
const MIGRATION_KEY = "storage-schema-v2";

let dbPromise;
let database = null;
let cache = null;
const pendingWrites = new Set();
let errorShown = false;

// Existing screens read synchronously. Load the cache before createApp(), then
// start an IndexedDB transaction for each mutation.
export const appStorage = {
  getItem(key) {
    if (cache) return cache.get(String(key)) ?? null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    key = String(key);
    value = String(value);
    if (!cache) return localStorage.setItem(key, value);
    trackWrite(() => database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(value, key));
    cache.set(key, value);
  },
  removeItem(key) {
    key = String(key);
    if (!cache) return localStorage.removeItem(key);
    trackWrite(() => database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key));
    cache.delete(key);
  }
};

export async function initializePersistentStorage() {
  if (typeof indexedDB === "undefined") return;

  const db = await openDatabase();
  const values = new Map(await readAllEntries(db));

  if (!values.has(MIGRATION_KEY)) {
    // localStorage was the source of truth in earlier releases.
    for (const key of getLocalDataKeys()) values.set(key, localStorage.getItem(key) ?? "");
    await replaceEntries(db, values);
    clearLegacyData();
  }

  values.delete(MIGRATION_KEY);
  database = db;
  cache = values;
}

export async function exportBackup() {
  await flushWrites();
  const data = Object.fromEntries(cache || getLocalDataKeys().map((key) => [key, localStorage.getItem(key) ?? ""]));
  return {
    app: "Slavikus Sport",
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
}

export async function waitForPendingWrites() {
  await Promise.all([...pendingWrites]);
}

export async function importBackup(backup) {
  if (!backup?.data || typeof backup.data !== "object" || Array.isArray(backup.data)) {
    throw new Error("Некорректный файл резервной копии");
  }

  const entries = Object.entries(backup.data)
    .filter(([key]) => key.startsWith(KEY_PREFIX))
    .map(([key, value]) => [key, /^slavikus:log(?::|$)/.test(key) ? cleanBackupLog(value) : String(value)]);

  await flushWrites();
  if (database) {
    await replaceEntries(database, new Map(entries));
    cache = new Map(entries);
    clearLegacyData();
  } else {
    clearLegacyData();
    for (const [key, value] of entries) localStorage.setItem(key, value);
  }
  return { ...backup, data: Object.fromEntries(entries) };
}

function cleanBackupLog(value) {
  let entries;
  try {
    entries = JSON.parse(value);
  } catch {
    throw new Error("Некорректные данные лога в резервной копии.");
  }
  if (!Array.isArray(entries) || entries.some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry))) {
    throw new Error("Некорректные данные лога в резервной копии.");
  }
  return JSON.stringify(cleanZeroLogEntries(entries));
}

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function getLocalDataKeys() {
  return Object.keys(localStorage).filter((key) => key.startsWith(KEY_PREFIX));
}

function clearLegacyData() {
  for (const key of getLocalDataKeys()) localStorage.removeItem(key);
}

function readAllEntries(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const keys = store.getAllKeys();
    const values = store.getAll();
    transaction.oncomplete = () => resolve(keys.result.map((key, index) => [key, values.result[index]]));
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function replaceEntries(db, values) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    for (const [key, value] of values) store.put(value, key);
    store.put("true", MIGRATION_KEY);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function trackWrite(start) {
  const request = start();
  const transaction = request.transaction;
  const completion = new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  pendingWrites.add(completion);
  completion.then(
    () => pendingWrites.delete(completion),
    (error) => {
      pendingWrites.delete(completion);
      console.error("Не удалось сохранить данные в IndexedDB", error);
      if (!errorShown && typeof window !== "undefined") {
        errorShown = true;
        window.alert("Не удалось сохранить данные на устройстве. Проверь свободное место и создай резервную копию.");
      }
    }
  );
}

async function flushWrites() {
  await Promise.allSettled([...pendingWrites]);
}
