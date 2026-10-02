import test from "node:test";
import assert from "node:assert/strict";
import startWorkout from "../src/actions/startWorkout.js";
import toggleWorkout from "../src/actions/toggleWorkout.js";
import { getActiveSession } from "../src/features/workout/workoutTimer.js";
import { addSetResult } from "../src/features/workout/workoutRunner.js";
import { finishWorkout as saveWorkoutToLog } from "../src/features/workout/workoutStorage.js";
import { getRunTotals, isRunExercise } from "../src/features/workout/automaticRunTracking.js";
import { todayIso } from "../src/features/program/calendarPlanner.js";
import completeSet from "../src/actions/completeSet.js";

test("Android Start records only Бег and pause segments become one log result", async () => {
  const previousStorage = globalThis.localStorage;
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  const values = new Map();
  const segments = [
    { meters: 1200, seconds: 360, route: [[55.7, 37.6], [55.71, 37.61]] },
    { meters: 800, seconds: 240, route: [[55.71, 37.61], [55.72, 37.62]] }
  ];
  let starts = 0;
  let stops = 0;
  let active = false;
  const tracker = {
    status: async () => ({ active, meters: 0, seconds: 0 }),
    start: async () => { starts += 1; active = true; return { active: true }; },
    stop: async () => { stops += 1; active = false; return segments.shift(); }
  };
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  globalThis.window = { Capacitor: {
    getPlatform: () => "android",
    isPluginAvailable: () => true,
    Plugins: { RunTracker: tracker }
  }, dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  try {
    const workout = { id: "run-auto", title: "Пробежка", exercises: [{ name: "Бег", measure: "distanceKm", target: "2", sets: 1 }] };
    values.set("slavikus:user", JSON.stringify({ id: "runner" }));
    values.set("slavikus:workouts", JSON.stringify([workout]));
    values.set("slavikus:calendar:runner", JSON.stringify({ [todayIso()]: workout.id }));
    assert.equal(isRunExercise({ name: "Заплыв", measure: "distanceKm" }), false);
    assert.equal(isRunExercise({ name: "Бег", measure: "distanceM" }), false);

    await startWorkout();
    assert.equal(starts, 1);
    assert.equal(getActiveSession().trackerStarted, true);
    await toggleWorkout();
    assert.equal(stops, 1);
    assert.equal(getActiveSession().running, false);
    assert.equal(getActiveSession().results[0].gpsMeters, 1200);
    await toggleWorkout();
    assert.equal(starts, 2);
    await toggleWorkout();
    const session = getActiveSession();
    assert.equal(stops, 2);
    assert.deepEqual(getRunTotals(session.results[0]), { meters: 2000, seconds: 600 });
    assert.equal(session.results[0].routes.length, 2);

    addSetResult(session, { distance: "2", seconds: 600 });
    const entry = saveWorkoutToLog(session);
    assert.deepEqual(entry.results[0].done, ["2"]);
    assert.deepEqual(entry.results[0].times, [600]);
    assert.equal(entry.results[0].routes.length, 2);

    const strength = { id: "strength-auto", title: "Силовая", exercises: [{ name: "Присед", measure: "weighted", target: "10", sets: 1 }] };
    values.set("slavikus:workouts", JSON.stringify([strength]));
    values.set("slavikus:calendar:runner", JSON.stringify({ [todayIso()]: strength.id }));
    await startWorkout();
    assert.equal(starts, 2);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.window = previousWindow;
    globalThis.CustomEvent = previousCustomEvent;
  }
});

test("completing Бег saves GPS distance, time and route before the next exercise", async () => {
  const previousStorage = globalThis.localStorage;
  const previousWindow = globalThis.window;
  const previousCustomEvent = globalThis.CustomEvent;
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  const previousDocument = globalThis.document;
  const values = new Map();
  const snapshot = { active: true, meters: 5000, seconds: 1800, route: [[55.7, 37.6], [55.71, 37.61]] };
  let stops = 0;
  const tracker = {
    status: async () => snapshot,
    stop: async () => { stops += 1; return snapshot; },
    start: async () => { throw new Error("GPS не должен запускаться для отжиманий"); }
  };
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  globalThis.window = { Capacitor: {
    getPlatform: () => "android",
    isPluginAvailable: () => true,
    Plugins: { RunTracker: tracker }
  }, dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  globalThis.requestAnimationFrame = (callback) => callback();
  globalThis.document = { querySelector: () => null };
  try {
    const workout = { id: "mixed-auto", title: "Смешанная", exercises: [
      { name: "Бег", measure: "distanceKm", target: "5", sets: 1 },
      { name: "Отжимания", measure: "repeats", target: "10", sets: 1 }
    ] };
    values.set("slavikus:user", JSON.stringify({ id: "runner" }));
    values.set("slavikus:workouts", JSON.stringify([workout]));
    values.set("slavikus:calendar:runner", JSON.stringify({ [todayIso()]: workout.id }));
    const session = {
      id: "session", workoutId: workout.id, title: workout.title, currentExercise: 0,
      currentSet: 1, running: true, startedAt: Date.now(), elapsed: 0,
      trackerStarted: true, results: workout.exercises.map((exercise) => ({ ...exercise, done: [], weights: [], times: [] }))
    };
    values.set("slavikus:active-workout", JSON.stringify(session));
    const card = { querySelector: (selector) => ({ value: selector === "[data-distance-value]" ? "" : "" }) };
    const button = { closest: (selector) => selector === ".current-card" ? card : { scrollTop: 0 } };
    await completeSet(button);
    const saved = getActiveSession();
    assert.equal(stops, 1);
    assert.equal(saved.trackerStarted, false);
    assert.equal(saved.currentExercise, 1);
    assert.deepEqual(saved.results[0].done, ["5"]);
    assert.deepEqual(saved.results[0].times, [1800]);
    assert.equal(saved.results[0].routes.length, 1);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.window = previousWindow;
    globalThis.CustomEvent = previousCustomEvent;
    globalThis.requestAnimationFrame = previousAnimationFrame;
    globalThis.document = previousDocument;
  }
});
