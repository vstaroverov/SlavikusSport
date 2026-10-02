import test from "node:test";
import assert from "node:assert/strict";
import { renderLogScreen } from "../src/screens/LogScreen.js";
import { renderWorkoutLogCard } from "../src/components/WorkoutLogCard.js";

test("log screen gives empty state and keeps manual entry action", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    const empty = renderLogScreen();
    assert.match(empty, /vsg-sport-log-page-head/);
    assert.match(empty, /data-action="addManualLog"/);
    assert.match(empty, /data-route="workout"/);

    values.set("slavikus:log:guest", JSON.stringify([{
      id: "test-log", title: "Пробежка", finishedAt: "02.10.2026, 08:30",
      duration: "00:37:12", results: [{ name: "Бег", measure: "distanceKm", done: ["10"], times: [2232], sets: 1 }]
    }]));
    const filled = renderLogScreen();
    assert.match(filled, /vsg-sport-log-card/);
    assert.match(filled, /10 км за 37:12/);
    assert.doesNotMatch(filled, /vsg-sport-log-empty/);
  } finally {
    globalThis.localStorage = previous;
  }
});

test("log card keeps editing, sharing and route actions in the new layout", () => {
  const entry = {
    id: "run-1", title: "Бег <утро>", finishedAt: "02.10.2026, 08:30", duration: "00:37:12",
    results: [{ name: "Бег", measure: "distanceKm", done: ["10"], times: [2232], sets: 1,
      routes: [[[55.7, 37.5], [55.71, 37.52]]] }]
  };
  const html = renderWorkoutLogCard(entry, [entry], true);
  assert.match(html, /Бег &lt;утро&gt;/);
  assert.match(html, /vsg-sport-route/);
  for (const action of ["editLog", "shareLog", "deleteLog", "addLogExercise"]) {
    assert.match(html, new RegExp(`data-action="${action}"`));
  }
  for (const field of ["name", "distance", "time"]) {
    assert.match(html, new RegExp(`data-field="${field}"`));
  }
  assert.doesNotMatch(html, /data-field="sets"/);
  assert.match(html, /data-log-editor="run-1" hidden/);
  assert.match(html, /data-log-date="run-1" hidden/);
});
