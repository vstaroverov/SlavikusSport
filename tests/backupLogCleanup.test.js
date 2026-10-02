import test from "node:test";
import assert from "node:assert/strict";
import { exportBackup, importBackup } from "../src/features/storage/persistentStorage.js";
import { getBackupSummaryText } from "../src/features/storage/backupFiles.js";

test("backup import removes zero log positions before replacing stored data", async () => {
  const previous = globalThis.localStorage;
  const values = new Map([["slavikus:user", "previous user"]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); globalThis.localStorage[key] = String(value); },
    removeItem: (key) => { values.delete(key); delete globalThis.localStorage[key]; }
  };
  globalThis.localStorage["slavikus:user"] = "previous user";
  try {
    const backup = {
      exportedAt: "2026-10-01T12:00:00.000Z",
      data: {
        "slavikus:user": JSON.stringify({ id: "restored" }),
        "slavikus:log:restored": JSON.stringify([
          { id: "zero", text: "Присед 0", results: [{ name: "Присед", done: ["0"], sets: 1 }] },
          { id: "mixed", text: "Присед 0, 12; Бег 0", results: [
            { name: "Присед", done: ["0", "12"], weights: ["", "20"], sets: 2 },
            { name: "Бег", measure: "distanceKm", done: ["0"], times: [0], sets: 1 }
          ] },
          { id: "completion", text: "Заминка · Выполнена", results: [{ name: "Заминка", measure: "completion", done: ["1"], sets: 1 }] }
        ]),
        "slavikus:log": JSON.stringify([{ id: "legacy-zero", text: "0 кг" }, { id: "zero-repeats", text: "0 повторений" }]),
        "slavikus:workouts": JSON.stringify([{ id: "workout", title: "Тренировка" }])
      }
    };

    const restored = await importBackup(backup);
    const entries = JSON.parse(values.get("slavikus:log:restored"));
    assert.deepEqual(entries.map((entry) => entry.id), ["mixed", "completion"]);
    assert.deepEqual(entries[0].results.map((result) => result.name), ["Присед"]);
    assert.deepEqual(entries[0].results[0].done, ["12"]);
    assert.deepEqual(entries[0].results[0].weights, ["20"]);
    assert.equal(entries[0].results[0].sets, 1);
    assert.doesNotMatch(entries[0].text, /(?:^|\D)0(?:\D|$)/);
    assert.deepEqual(JSON.parse(values.get("slavikus:log")), []);
    assert.match(getBackupSummaryText(restored), /Лог: 2 записей/);
    assert.equal(JSON.parse(backup.data["slavikus:log:restored"]).length, 3);
    assert.equal(JSON.parse(values.get("slavikus:workouts")).length, 1);

    const beforeInvalidImport = (await exportBackup()).data;
    await assert.rejects(importBackup({ data: { "slavikus:log:restored": "not json" } }), /Некорректные данные лога/);
    assert.deepEqual((await exportBackup()).data, beforeInvalidImport);
  } finally {
    globalThis.localStorage = previous;
  }
});
