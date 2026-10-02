import test from "node:test";
import assert from "node:assert/strict";
import { legacyBackup } from "./fixtures/legacyFiles.js";

function makeLocalStorage(initial = {}) {
  const storage = {
    getItem(key) { return Object.hasOwn(this, key) ? this[key] : null; },
    setItem(key, value) { this[key] = String(value); },
    removeItem(key) { delete this[key]; }
  };
  return Object.assign(storage, initial);
}

function makeIndexedDB(initial = {}) {
  const data = new Map(Object.entries(initial));
  const db = {
    objectStoreNames: { contains: () => true },
    transaction() {
      const operations = [];
      const transaction = {
        objectStore() {
          const request = (operation) => {
            const result = { transaction };
            operations.push(() => { result.result = operation(); });
            return result;
          };
          return {
            getAllKeys: () => request(() => [...data.keys()].sort()),
            getAll: () => request(() => [...data.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value)),
            clear: () => request(() => data.clear()),
            put: (value, key) => request(() => data.set(key, value)),
            delete: (key) => request(() => data.delete(key))
          };
        }
      };
      setTimeout(() => {
        for (const operation of operations) operation();
        transaction.oncomplete?.();
      }, 0);
      return transaction;
    }
  };
  return {
    data,
    open() {
      const request = { result: db };
      setTimeout(() => request.onsuccess?.(), 0);
      return request;
    }
  };
}

test("legacy data moves to IndexedDB, then backup restore replaces all keys", async () => {
  const originalLocalStorage = globalThis.localStorage;
  const originalIndexedDB = globalThis.indexedDB;
  try {
    globalThis.localStorage = makeLocalStorage({
      "slavikus:user": "latest profile",
      "slavikus:log": "old log"
    });
    globalThis.indexedDB = makeIndexedDB({ "slavikus:user": "stale profile" });

    const first = await import("../src/features/storage/persistentStorage.js?first");
    await first.initializePersistentStorage();
    assert.equal(first.appStorage.getItem("slavikus:user"), "latest profile");
    assert.equal(globalThis.localStorage.getItem("slavikus:user"), null);
    assert.equal(globalThis.indexedDB.data.get("slavikus:log"), "old log");

    first.appStorage.setItem("slavikus:log", "new log");
    assert.equal((await first.exportBackup()).data["slavikus:log"], "new log");
    assert.equal(globalThis.indexedDB.data.get("slavikus:log"), "new log");

    await first.importBackup({ data: { "slavikus:user": "restored profile" } });
    assert.equal(first.appStorage.getItem("slavikus:log"), null);
    assert.equal(globalThis.indexedDB.data.has("slavikus:log"), false);
    assert.equal((await first.exportBackup()).data["slavikus:user"], "restored profile");

    await first.importBackup({ data: {
      "slavikus:user": "restored profile",
      "slavikus:log:restored": JSON.stringify([
        { id: "zero", results: [{ name: "Присед", done: ["0"] }] },
        { id: "valid", results: [{ name: "Присед", done: ["0", "10"] }] }
      ])
    } });
    assert.deepEqual(JSON.parse(globalThis.indexedDB.data.get("slavikus:log:restored")).map((entry) => entry.id), ["valid"]);
    assert.deepEqual(JSON.parse(first.appStorage.getItem("slavikus:log:restored"))[0].results[0].done, ["10"]);

    globalThis.localStorage.setItem("slavikus:user", "stale legacy profile");
    const second = await import("../src/features/storage/persistentStorage.js?second");
    await second.initializePersistentStorage();
    assert.equal(second.appStorage.getItem("slavikus:user"), "restored profile");

    const olderBackup = legacyBackup();
    await second.importBackup(olderBackup);
    assert.equal(JSON.parse(globalThis.indexedDB.data.get("slavikus:log:vk-demo-user")).length, 24);
    assert.equal(JSON.parse(second.appStorage.getItem("slavikus:workouts")).length, 4);
  } finally {
    globalThis.localStorage = originalLocalStorage;
    globalThis.indexedDB = originalIndexedDB;
  }
});
