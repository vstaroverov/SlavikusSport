import test from "node:test";
import assert from "node:assert/strict";
import { renderExercisesScreen } from "../src/screens/ExercisesScreen.js";
import { toggleExerciseCatalogEditMode } from "../src/features/exercises/exercisesStorage.js";

test("exercise directory has distinct view and edit modes with units and categories", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };

  const viewing = renderExercisesScreen();
  assert.match(viewing, /vsg-sport-catalog-screen/);
  assert.match(viewing, /Изменить список/);
  assert.match(viewing, /aria-pressed="false"/);
  assert.match(viewing, /Бег/);
  assert.match(viewing, /км · время/);
  assert.match(viewing, /Воркаут/);
  assert.doesNotMatch(viewing, /data-action="deleteCatalogExercise"/);

  toggleExerciseCatalogEditMode();
  const editing = renderExercisesScreen();
  assert.match(editing, /aria-pressed="true"/);
  assert.match(editing, />Готово<\/button>/);
  assert.match(editing, /data-action="renameCatalogExercise"/);
  assert.match(editing, /data-action="deleteCatalogExercise"/);
});
