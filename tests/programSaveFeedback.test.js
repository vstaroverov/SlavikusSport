import test from "node:test";
import assert from "node:assert/strict";
import saveWorkoutEditor from "../src/actions/saveWorkoutEditor.js";
import { getWorkouts } from "../src/features/program/programStorage.js";
import { getActiveWorkoutEditorId } from "../src/features/program/programEditorState.js";
import { renderProgramScreen } from "../src/screens/ProgramScreen.js";

test("saving a program workout confirms the change and closes its editor", async () => {
  const previous = {
    localStorage: globalThis.localStorage,
    document: globalThis.document,
    window: globalThis.window,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  const values = new Map([
    ["slavikus:user", JSON.stringify({ id: "program-save" })],
    ["slavikus:program-edit", "true"],
    ["slavikus:program-active-workout", "workout-1"],
    ["slavikus:workouts", JSON.stringify([{
      id: "workout-1", title: "День ног", exercises: [{ name: "Приседания", measure: "repeats", target: "10", sets: 3 }]
    }])]
  ]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  let dialog;
  let changes = 0;
  const shell = { scrollTop: 120 };
  const summary = { focus() {} };
  const card = { dataset: { programWorkoutId: "workout-1" }, querySelector: () => summary };
  const input = {
    dataset: { workoutId: "workout-1", exerciseIndex: "0", field: "target" },
    value: "12",
    checkValidity: () => true
  };
  const editor = { querySelectorAll: () => [input] };
  const button = {
    dataset: { workoutId: "workout-1" },
    textContent: "Сохранить",
    disabled: false,
    closest: (selector) => selector === ".phone-shell" ? shell : editor
  };
  globalThis.document = {
    activeElement: button,
    body: { append(value) { dialog = value; } },
    querySelector: () => shell,
    querySelectorAll: () => [card],
    createElement() {
      const elements = new Map();
      return {
        setAttribute() {},
        querySelector(selector) {
          if (!elements.has(selector)) elements.set(selector, { textContent: "", focus() {} });
          return elements.get(selector);
        },
        addEventListener() {},
        showModal() {},
        remove() {}
      };
    }
  };
  globalThis.window = { dispatchEvent() { changes += 1; } };
  globalThis.requestAnimationFrame = (callback) => callback();
  try {
    await saveWorkoutEditor(button);
    assert.equal(getWorkouts()[0].exercises[0].target, "12");
    assert.equal(getActiveWorkoutEditorId(), null);
    assert.equal(changes, 1);
    assert.match(renderProgramScreen(), /data-program-workout-id="workout-1"(?![^>]*\bopen\b)/);
    assert.equal(dialog.querySelector("h2").textContent, "Тренировка сохранена");
    assert.match(dialog.innerHTML, /data-tone="success"/);

    input.checkValidity = () => false;
    input.reportValidity = () => { input.reported = true; };
    values.set("slavikus:program-active-workout", "workout-1");
    dialog = null;
    await saveWorkoutEditor(button);
    assert.equal(input.reported, true);
    assert.equal(getActiveWorkoutEditorId(), "workout-1");
    assert.equal(changes, 1);
    assert.equal(dialog, null);
  } finally {
    Object.assign(globalThis, previous);
  }
});
