import test from "node:test";
import assert from "node:assert/strict";
import { createWorkoutShare, importSharedWorkouts, parseWorkoutShare } from "../src/features/program/workoutSharing.js";

test("shares only selected workouts and imports them without replacing existing ones", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    const workouts = [
      { id: "one", title: "Бег", exercises: [{ name: "Бег", measure: "distanceKm", target: "10", time: "37:12", sets: 1 }] },
      { id: "two", title: "Силовая", exercises: [{ name: "Присед", measure: "weighted", target: "10", weight: "40", sets: 3 }] }
    ];
    values.set("slavikus:workouts", JSON.stringify([workouts[1]]));
    const file = createWorkoutShare(workouts, ["one"]);
    assert.equal(file.workouts.length, 1);
    assert.equal(file.workouts[0].exercises[0].time, "37:12");
    assert.equal(JSON.stringify(file).includes("Силовая"), false);
    assert.equal(JSON.stringify(file).includes('"id"'), false);
    assert.equal(importSharedWorkouts(JSON.stringify(file)), 1);
    const saved = JSON.parse(values.get("slavikus:workouts"));
    assert.equal(saved.length, 2);
    assert.equal(saved[0].id, "two");
    assert.notEqual(saved[1].id, "one");
    assert.equal(saved[1].exercises[0].measure, "distanceKm");
    assert.equal(saved[1].exercises[0].time, "37:12");
    assert.throws(() => parseWorkoutShare(JSON.stringify({ app: "Slavikus Sport", version: 1, data: {} })), /файл с тренировками/);
    assert.throws(() => parseWorkoutShare(JSON.stringify({ ...file, workouts: [{ title: "x", exercises: [{ name: "x", measure: "bogus" }] }] })), /единица измерения/);
  } finally {
    globalThis.localStorage = previous;
  }
});
