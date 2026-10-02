import test from "node:test";
import assert from "node:assert/strict";
import { getExerciseCatalog } from "../src/features/exercises/exercisesStorage.js";
import { createLogExerciseDraft } from "../src/actions/logExerciseDom.js";
import { renderLogExerciseEditor } from "../src/components/WorkoutLogCard.js";
import updateLogExercise from "../src/actions/updateLogExercise.js";
import { getLogEntry } from "../src/features/log/logStorage.js";

test("manual log editor uses the catalog fields for every exercise type", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    values.set("slavikus:exercise-catalog", JSON.stringify([
      { id: "run", name: "Бег", category: "workout", measure: "repeats" },
      { id: "swim", name: "Заплыв", category: "workout", measure: "weighted" }
    ]));
    const catalog = getExerciseCatalog();
    assert.equal(catalog.find((item) => item.name === "Бег").measure, "distanceKm");
    assert.equal(catalog.find((item) => item.name === "Заплыв").measure, "distanceM");

    for (const exercise of catalog) {
      const draft = createLogExerciseDraft(exercise.name);
      assert.equal(draft.measure, exercise.measure, exercise.name);
      const html = renderLogExerciseEditor("manual", [draft]);
      const fields = new Set([...html.matchAll(/data-field="([^"]+)"/g)].map((match) => match[1]));
      const expected = {
        distanceKm: ["name", "distance", "time"],
        distanceM: ["name", "distance", "time"],
        completion: ["name", "completed"],
        seconds: ["name", "repeats", "sets"],
        repeats: ["name", "repeats", "sets"],
        weighted: ["name", "weight", "repeats", "sets"]
      }[exercise.measure];
      assert.deepEqual([...fields].sort(), expected.sort(), exercise.name);
      if (exercise.name === "Бег") assert.match(html, /Дистанция, м/);
      if (exercise.name === "Заплыв") assert.match(html, /Дистанция, м/);
    }
  } finally {
    globalThis.localStorage = previous;
  }
});

test("changing a manual log exercise rebuilds its fields and clears the old result", () => {
  const previousStorage = globalThis.localStorage;
  const previousDocument = globalThis.document;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  values.set("slavikus:user", JSON.stringify({ id: "log-type-test" }));
  values.set("slavikus:log:log-type-test", JSON.stringify([{
    id: "manual-1", title: "Ручная запись", finishedAt: "02.10.2026, 10:00",
    results: [{ name: "Присед", measure: "repeats", done: ["12"], sets: 1 }], text: "Присед 12"
  }]));
  let rendered = "";
  const nameControl = { value: "Бег", focus() {} };
  const row = {
    dataset: { measure: "repeats" },
    querySelector(selector) {
      if (selector === '[data-field="name"]') return nameControl;
      if (selector === '[data-field="repeats"]') return { value: "12" };
      if (selector === '[data-field="sets"]') return { value: "1" };
      return null;
    }
  };
  const list = { replaceWith(node) { rendered = node.markup; } };
  const editor = {
    querySelector: (selector) => selector === ".vsg-sport-log-edit-list" ? list : null,
    querySelectorAll: () => [row]
  };
  const textNode = { textContent: "" };
  globalThis.document = {
    querySelector(selector) {
      if (selector === '[data-log-editor="manual-1"]') return editor;
      if (selector === '[data-log-text="manual-1"]') return textNode;
      return null;
    },
    createElement() {
      const template = { content: { firstElementChild: null } };
      Object.defineProperty(template, "innerHTML", { set(value) { template.content.firstElementChild = { markup: value }; } });
      return template;
    }
  };
  try {
    updateLogExercise({ dataset: { logId: "manual-1", field: "name", exerciseIndex: "0" }, value: "Бег" });
    const entry = getLogEntry("manual-1");
    assert.deepEqual(entry.results[0].done, []);
    assert.equal(entry.results[0].measure, "distanceKm");
    assert.match(rendered, /data-field="distance"/);
    assert.match(rendered, /data-field="time"/);
    assert.match(rendered, /Дистанция, м/);
    assert.doesNotMatch(rendered, /data-field="repeats"|data-field="sets"/);

    row.dataset.measure = "distanceKm";
    row.querySelector = (selector) => ({
      '[data-field="name"]': nameControl,
      '[data-field="distance"]': { value: "5000" },
      '[data-field="time"]': { value: "30:00" }
    })[selector] || null;
    updateLogExercise({ dataset: { logId: "manual-1", field: "distance", exerciseIndex: "0" } });
    assert.deepEqual(getLogEntry("manual-1").results[0].done, ["5"]);
    assert.deepEqual(getLogEntry("manual-1").results[0].times, [1800]);
    assert.equal(textNode.textContent, "Бег 5 км за 30:00");
    assert.match(renderLogExerciseEditor("manual-1", getLogEntry("manual-1").results), /value="5000"/);

    nameControl.value = "Заплыв";
    updateLogExercise({ dataset: { logId: "manual-1", field: "name", exerciseIndex: "0" }, value: "Заплыв" });
    assert.equal(getLogEntry("manual-1").results[0].measure, "distanceM");
    assert.match(rendered, /Дистанция, м/);
    row.dataset.measure = "distanceM";
    row.querySelector = (selector) => ({
      '[data-field="name"]': nameControl,
      '[data-field="distance"]': { value: "500" },
      '[data-field="time"]': { value: "10:30" }
    })[selector] || null;
    updateLogExercise({ dataset: { logId: "manual-1", field: "distance", exerciseIndex: "0" } });
    assert.deepEqual(getLogEntry("manual-1").results[0].done, ["500"]);
    assert.equal(textNode.textContent, "Заплыв 500 м за 10:30");
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.document = previousDocument;
  }
});
