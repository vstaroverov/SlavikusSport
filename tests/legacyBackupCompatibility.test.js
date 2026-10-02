import test from "node:test";
import assert from "node:assert/strict";
import { importSportFile } from "../src/features/storage/importSportFile.js";
import { legacyBackup, legacyWorkoutShare } from "./fixtures/legacyFiles.js";

test("older full backup and shared workout files both load from Profile", async () => {
  const previous = globalThis.localStorage;
  const values = new Map([["slavikus:user", "previous user"], ["slavikus:log:old", "[]"]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); globalThis.localStorage[key] = String(value); },
    removeItem: (key) => { values.delete(key); delete globalThis.localStorage[key]; }
  };
  for (const [key, value] of values) globalThis.localStorage[key] = value;
  try {
    const oldBackupText = JSON.stringify(legacyBackup());
    const oldBackup = JSON.parse(oldBackupText);
    const originalLog = JSON.parse(oldBackup.data["slavikus:log:vk-demo-user"]);
    const backupResult = await importSportFile(oldBackupText);
    const restoredLog = JSON.parse(values.get("slavikus:log:vk-demo-user"));
    assert.equal(backupResult.kind, "backup");
    assert.equal(originalLog.length, 25);
    assert.equal(restoredLog.length, 24);
    assert.match(backupResult.summary, /Лог: 24 записей/);
    assert.equal(values.has("slavikus:log:old"), false);
    assert.equal(JSON.parse(values.get("slavikus:workouts")).length, 4);

    const restoredUser = values.get("slavikus:user");
    const restoredLogText = values.get("slavikus:log:vk-demo-user");
    const sharedWorkoutsText = JSON.stringify(legacyWorkoutShare());
    const shareResult = await importSportFile(sharedWorkoutsText);
    assert.deepEqual(shareResult, { kind: "workout-share", count: 1 });
    assert.equal(JSON.parse(values.get("slavikus:workouts")).length, 5);
    assert.equal(values.get("slavikus:user"), restoredUser);
    assert.equal(values.get("slavikus:log:vk-demo-user"), restoredLogText);
  } finally {
    globalThis.localStorage = previous;
  }
});
