import test from "node:test";
import assert from "node:assert/strict";
import assignWorkout from "../src/actions/assignWorkout.js";
import { getPlannedWorkoutId } from "../src/features/program/calendarPlanner.js";

test("date dialog marks the current plan and changes it only after a choice", async () => {
  const previousStorage = globalThis.localStorage;
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const previousFrame = globalThis.requestAnimationFrame;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  values.set("slavikus:user", JSON.stringify({ id: "calendar-dialog" }));
  values.set("slavikus:workouts", JSON.stringify([
    { id: "strength", title: "Силовая", exercises: [{ name: "Присед", measure: "repeats", target: "10", sets: 3 }] },
    { id: "run", title: "Пробежка", exercises: [{ name: "Бег", measure: "distanceKm", target: "5", sets: 1 }] }
  ]));
  values.set("slavikus:calendar:calendar-dialog", JSON.stringify({ "2026-10-02": "strength" }));
  let dialog;
  let changed = 0;
  const shell = { scrollTop: 180 };
  const trigger = {
    dataset: { date: "2026-10-02" },
    parentElement: { querySelectorAll: () => [] },
    setAttribute() {}, focus() {},
    closest: () => shell
  };
  globalThis.document = {
    body: { append(value) { dialog = value; } },
    querySelector: () => shell,
    createElement() {
      const cancel = { addEventListener(event, callback) { this.onClick = callback; } };
      const choices = ["rest", "strength", "run"].map((id) => ({
        dataset: { workoutChoice: id },
        addEventListener(event, callback) { this.onClick = callback; },
        focus() {}
      }));
      return {
        setAttribute() {},
        querySelector: (selector) => selector === "[data-choice-cancel]" ? cancel : choices[0],
        querySelectorAll: () => choices,
        addEventListener(event, callback) { if (event === "close") this.onClose = callback; },
        showModal() {},
        close(value = "") { this.returnValue = value; this.onClose(); },
        remove() {},
        choices,
        cancel
      };
    }
  };
  globalThis.window = { dispatchEvent() { changed += 1; } };
  globalThis.requestAnimationFrame = (callback) => callback();
  try {
    const cancelled = assignWorkout(trigger);
    assert.match(dialog.className, /vsg-sport-program-day-dialog/);
    assert.match(dialog.innerHTML, /2 октября 2026/);
    assert.match(dialog.innerHTML, /Сейчас: Силовая/);
    assert.match(dialog.innerHTML, /data-workout-choice="strength" aria-pressed="true"/);
    dialog.cancel.onClick();
    await cancelled;
    assert.equal(getPlannedWorkoutId("2026-10-02", false), "strength");
    assert.equal(changed, 0);

    const selected = assignWorkout(trigger);
    dialog.choices[2].onClick();
    await selected;
    assert.equal(getPlannedWorkoutId("2026-10-02", false), "run");
    assert.equal(changed, 1);
    assert.equal(shell.scrollTop, 180);

    const rested = assignWorkout(trigger);
    dialog.choices[0].onClick();
    await rested;
    assert.equal(getPlannedWorkoutId("2026-10-02", false), null);
    assert.equal(changed, 2);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
    globalThis.requestAnimationFrame = previousFrame;
  }
});
