import test from "node:test";
import assert from "node:assert/strict";
import { renderWorkoutScreen } from "../src/screens/WorkoutScreen.js";
import { createWorkoutSession } from "../src/features/workout/workoutRunner.js";
import { todayIso } from "../src/features/program/calendarPlanner.js";

test("workout screen keeps start, pause, set and distance actions in new cards", () => {
  const previousStorage = globalThis.localStorage;
  const previousWindow = globalThis.window;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  globalThis.window = { Capacitor: null };
  try {
    values.set("slavikus:user", JSON.stringify({ id: "design-test" }));
    assert.match(renderWorkoutScreen(), /data-route="program"/);

    const workout = { id: "design-workout", title: "Силовая", exercises: [{ name: "Присед", measure: "weighted", target: "10", weight: "40", sets: 3 }] };
    values.set("slavikus:workouts", JSON.stringify([workout]));
    values.set("slavikus:calendar:design-test", JSON.stringify({ [todayIso()]: workout.id }));
    const waiting = renderWorkoutScreen();
    assert.match(waiting, /data-state="waiting"/);
    assert.match(waiting, /data-action="startWorkout"/);
    assert.match(waiting, /vsg-sport-exercise-list/);

    const session = createWorkoutSession(workout);
    values.set("slavikus:active-workout", JSON.stringify(session));
    const running = renderWorkoutScreen();
    assert.match(running, /data-state="running"/);
    assert.match(running, /data-action="toggleWorkout"/);
    assert.match(running, /data-set-value/);
    assert.match(running, /data-action="completeSet"/);
    assert.match(running, /data-action="skipSet"/);

    session.running = false;
    values.set("slavikus:active-workout", JSON.stringify(session));
    const paused = renderWorkoutScreen();
    assert.match(paused, /data-state="paused"/);
    assert.match(paused, /Продолжи тренировку/);
    assert.doesNotMatch(paused, /data-action="completeSet"/);

    const run = { id: "design-run", title: "Пробежка", exercises: [{ name: "Бег", measure: "distanceKm", target: "5", time: "28:00", sets: 1 }] };
    values.set("slavikus:workouts", JSON.stringify([run]));
    values.set("slavikus:calendar:design-test", JSON.stringify({ [todayIso()]: run.id }));
    values.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(run)));
    globalThis.window.Capacitor = { getPlatform: () => "android" };
    const runningDistance = renderWorkoutScreen();
    assert.match(runningDistance, /data-distance-value/);
    assert.match(runningDistance, /data-duration-value/);
    assert.match(runningDistance, /data-run-tracker/);
    assert.doesNotMatch(runningDistance, /data-action="toggleRunTracker"/);
    assert.doesNotMatch(runningDistance, /data-set-value/);
    run.exercises[0].name = "Спринт";
    values.set("slavikus:workouts", JSON.stringify([run]));
    values.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(run)));
    assert.doesNotMatch(renderWorkoutScreen(), /data-run-tracker/);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.window = previousWindow;
  }
});
