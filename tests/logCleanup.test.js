import test from "node:test";
import assert from "node:assert/strict";
import { addLogEntry, discardLogDrafts, finishLogEdit, getLogEntries, updateLogDetails } from "../src/features/log/logStorage.js";

test("stored log drops zero-only records and zero approaches without losing completed results", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    values.set("slavikus:user", JSON.stringify({ id: "zero-cleanup" }));
    const entries = [
      { id: "only-zero", finishedAt: "01.10.2026, 10:00", results: [{ name: "Присед", measure: "repeats", done: ["0"], sets: 1 }], text: "Присед 0" },
      { id: "plain-zero", finishedAt: "01.10.2026, 11:00", text: "0" },
      { id: "zero-time", finishedAt: "01.10.2026, 11:30", text: "00:00:00" },
      { id: "legacy-zero", finishedAt: "01.10.2026, 12:00", text: "Отжимания 0" },
      { id: "mixed", finishedAt: "02.10.2026, 10:00", results: [
        { name: "Присед", measure: "repeats", done: ["0", "12"], weights: ["", ""], sets: 2 },
        { name: "Вис", measure: "seconds", done: ["0"], sets: 1 }
      ], text: "Присед 0, 12\nВис 0 с" },
      { id: "completion", finishedAt: "02.10.2026, 11:00", results: [{ name: "Заминка", measure: "completion", done: ["1"], sets: 1 }], text: "Заминка · Выполнена" },
      { id: "draft", finishedAt: "02.10.2026, 12:00", results: [], text: "" },
      { id: "exercise-draft", finishedAt: "02.10.2026, 13:00", results: [{ name: "Присед", measure: "repeats", done: [], sets: 1 }], text: "" },
      { id: "distance-zero", finishedAt: "02.10.2026, 14:00", duration: "00:00:00", results: [{ name: "Бег", measure: "distanceKm", done: ["0"], times: [0] }], text: "Бег 0 км" }
    ];
    values.set("slavikus:log:zero-cleanup", JSON.stringify(entries));

    const cleaned = getLogEntries();
    assert.deepEqual(cleaned.map((entry) => entry.id), ["completion", "mixed"]);
    assert.deepEqual(cleaned.find((entry) => entry.id === "mixed").results[0].done, ["12"]);
    assert.equal(cleaned.find((entry) => entry.id === "mixed").text, "Присед 12");
    assert.equal(cleaned.find((entry) => entry.id === "completion").text, "Заминка · Выполнена");
    assert.deepEqual(getLogEntries(), cleaned);
    assert.deepEqual(JSON.parse(values.get("slavikus:log:zero-cleanup")).map((entry) => entry.id), ["mixed", "completion"]);
  } finally {
    globalThis.localStorage = previous;
  }
});

test("new manual log stays editable and an unfinished draft is discarded", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    values.set("slavikus:user", JSON.stringify({ id: "manual-cleanup" }));
    addLogEntry({ id: "unfinished", title: "Ручная запись", duration: "00:00:00", results: [], text: "", draft: true });
    assert.equal(getLogEntries().length, 1);
    discardLogDrafts();
    assert.deepEqual(getLogEntries(), []);

    addLogEntry({ id: "completed", title: "Ручная запись", duration: "00:00:00", results: [], text: "", draft: true });
    updateLogDetails("completed", { results: [{ name: "Присед", done: ["12"], sets: 1 }], text: "Присед 12" });
    finishLogEdit("completed");
    assert.equal(getLogEntries()[0].draft, false);
    assert.equal(getLogEntries()[0].results[0].done[0], "12");
  } finally {
    globalThis.localStorage = previous;
  }
});
