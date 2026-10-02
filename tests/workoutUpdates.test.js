import test from "node:test";
import assert from "node:assert/strict";
import { createWorkoutSession, addSetResult, skipSet } from "../src/features/workout/workoutRunner.js";
import { formatLogText, formatLogTextWithRecords, getLogResults, getWorkoutRecords } from "../src/features/log/logExercises.js";
import { buildExerciseStats } from "../src/features/stats/statsBuilder.js";
import { renderWorkoutScreen } from "../src/screens/WorkoutScreen.js";
import { renderProgramScreen } from "../src/screens/ProgramScreen.js";
import { todayIso } from "../src/features/program/calendarPlanner.js";
import { shareWorkout } from "../src/features/log/shareWorkout.js";
import { getWorkouts } from "../src/features/program/programStorage.js";
import { getActiveSession } from "../src/features/workout/workoutTimer.js";
import { getExerciseCatalog } from "../src/features/exercises/exercisesStorage.js";
import { updateCatalogExerciseAndWorkouts } from "../src/actions/renameCatalogExercise.js";
import { finishWorkout as saveWorkoutToLog } from "../src/features/workout/workoutStorage.js";
import { getLogEntries } from "../src/features/log/logStorage.js";

test("distance and time are saved as activity values", () => {
  const workout = { id: "run", title: "Пробежка", exercises: [{ name: "Бег", measure: "distanceKm", target: "3", sets: 1 }] };
  const session = createWorkoutSession(workout);
  addSetResult(session, { distance: "2,5", seconds: 900 });
  const result = session.results[0];
  assert.deepEqual(result.done, ["2.5"]);
  assert.deepEqual(result.times, [900]);
  assert.equal(formatLogText([result]), "Бег 2.5 км за 15:00");

  const entry = { id: "run-1", finishedAt: "01.10.2026, 12:00", results: [result] };
  const stat = buildExerciseStats([entry], [{ name: "Бег", measure: "distanceKm" }])[0];
  assert.equal(stat.measure, "distanceKm");
  assert.equal(stat.latest, 2.5);
  assert.equal(stat.points[0].timeSeconds, 900);
  assert.match(formatLogTextWithRecords(entry, [entry]), /★/);
});

test("existing hang plans and results use seconds without weight", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  const workout = { id: "hang", title: "Верх", exercises: [{ name: "Вис", measure: "weighted", target: "60", weight: "45", sets: 1 }] };
  const oldLog = { id: "hang-log", finishedAt: "01.10.2026, 12:00", results: [{ name: "Вис", measure: "weighted", target: "60", weight: "45", weights: ["45"], done: ["60"], sets: 1 }] };
  memory.set("slavikus:user", JSON.stringify({ id: "test" }));
  memory.set("slavikus:workouts", JSON.stringify([workout]));
  memory.set("slavikus:calendar:test", JSON.stringify({ [todayIso()]: "hang" }));
  memory.set("slavikus:log:test", JSON.stringify([oldLog]));
  memory.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(workout)));

  assert.deepEqual(getWorkouts()[0].exercises[0], { name: "Вис", measure: "seconds", target: "60", weight: "", sets: 1 });
  assert.equal(getActiveSession().results[0].measure, "seconds");
  const html = renderWorkoutScreen();
  assert.match(html, /План: 60 с/);
  assert.match(html, /Крайний 60 с/);
  assert.match(html, /Лучший 60 с/);
  assert.match(html, /Результат, секунды/);
  assert.doesNotMatch(html, /45х60/);
  assert.equal(formatLogText(getLogResults(oldLog)), "Вис 60 с");
  const stat = buildExerciseStats([oldLog], [{ name: "Вис", measure: "seconds" }])[0];
  assert.equal(stat.measure, "seconds");
  assert.equal(stat.bestWeight, 0);
  assert.equal(stat.latest, 60);
});

test("warmup is a completion fact with no numeric target or record", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  const oldWorkout = { id: "warmup", title: "Тренировка", exercises: [{ name: "Разминка", measure: "seconds", target: "60", weight: "10", sets: 3 }] };
  memory.set("slavikus:user", JSON.stringify({ id: "warmup-test" }));
  memory.set("slavikus:workouts", JSON.stringify([oldWorkout]));
  memory.set("slavikus:calendar:warmup-test", JSON.stringify({ [todayIso()]: "warmup" }));
  memory.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(oldWorkout)));

  assert.equal(getExerciseCatalog().find((exercise) => exercise.name === "Разминка").measure, "completion");
  const exercise = getWorkouts()[0].exercises[0];
  assert.deepEqual(exercise, { name: "Разминка", measure: "completion", target: "", weight: "", time: "", sets: 1 });
  assert.equal(getActiveSession().results[0].measure, "completion");
  const html = renderWorkoutScreen();
  assert.match(html, /Факт выполнения/);
  assert.match(html, /Выполнена/);
  assert.doesNotMatch(html, /Результат подхода|Результат, секунды|План: 60 с/);

  const session = createWorkoutSession({ ...oldWorkout, exercises: [exercise] });
  addSetResult(session, "");
  assert.equal(formatLogText(session.results), "Разминка · Выполнена");
  const entry = { id: "warmup-log", finishedAt: "02.10.2026, 12:00", results: session.results };
  assert.deepEqual(getWorkoutRecords(entry, [entry]), []);
  const stat = buildExerciseStats([entry], [{ name: "Разминка", measure: "completion" }])[0];
  assert.equal(stat.measure, "completion");
  assert.equal(stat.latest, 1);
  assert.equal(stat.bestWeight, 0);

  const skipped = createWorkoutSession({ ...oldWorkout, exercises: [exercise] });
  skipSet(skipped);
  assert.equal(formatLogText(skipped.results), "Разминка · Пропущена");
});

test("cooldown is a completion fact in old plans, active sessions and logs", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  memory.set("slavikus:exercise-catalog", JSON.stringify([{ id: "old-cooldown", name: "Заминка", category: "base", measure: "seconds" }]));
  memory.set("slavikus:exercise-completion-v1", "true");
  const oldWorkout = { id: "cooldown", title: "Тренировка", exercises: [{ name: "Заминка", measure: "seconds", target: "60", weight: "10", sets: 3 }] };
  memory.set("slavikus:user", JSON.stringify({ id: "cooldown-test" }));
  memory.set("slavikus:workouts", JSON.stringify([oldWorkout]));
  memory.set("slavikus:calendar:cooldown-test", JSON.stringify({ [todayIso()]: "cooldown" }));
  memory.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(oldWorkout)));

  assert.equal(getExerciseCatalog().find((exercise) => exercise.id === "old-cooldown").measure, "completion");
  const exercise = getWorkouts()[0].exercises[0];
  assert.deepEqual(exercise, { name: "Заминка", measure: "completion", target: "", weight: "", time: "", sets: 1 });
  assert.equal(getActiveSession().results[0].measure, "completion");
  assert.match(renderWorkoutScreen(), /Выполнена/);
  memory.set("slavikus:program-edit", "true");
  assert.match(renderProgramScreen(), /Без показателя · отметка выполнения/);

  const session = createWorkoutSession({ ...oldWorkout, exercises: [exercise] });
  addSetResult(session, "");
  assert.equal(formatLogText(session.results), "Заминка · Выполнена");
  const entry = { id: "cooldown-log", finishedAt: "02.10.2026, 12:00", results: session.results };
  assert.deepEqual(getWorkoutRecords(entry, [entry]), []);
  const stat = buildExerciseStats([entry], [{ name: "Заминка", measure: "completion" }])[0];
  assert.equal(stat.latest, 1);
  assert.equal(stat.bestWeight, 0);

  const oldLog = { results: [{ name: "Заминка", measure: "seconds", done: ["1"], weights: ["10"], sets: 3 }] };
  assert.equal(formatLogText(getLogResults(oldLog)), "Заминка · Выполнена");
  const skipped = createWorkoutSession({ ...oldWorkout, exercises: [exercise] });
  skipSet(skipped);
  assert.equal(formatLogText(skipped.results), "Заминка · Пропущена");
});

test("weighted bodyweight variants keep weight, reps and sets separate from ordinary exercises", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  const catalog = getExerciseCatalog();
  for (const name of ["Подтягивания", "Отжимания", "Брусья", "Гиперэкстензия"]) {
    assert.equal(catalog.find((exercise) => exercise.name === name)?.measure, "repeats");
    assert.equal(catalog.find((exercise) => exercise.name === `${name} с весом`)?.measure, "weighted");
  }

  const workout = { id: "upper", title: "Верх", exercises: [
    { name: "Подтягивания", measure: "repeats", target: "12", weight: "", sets: 3 },
    { name: "Отжимания", measure: "repeats", target: "8", weight: "15", sets: 4 }
  ] };
  memory.set("slavikus:workouts", JSON.stringify([workout]));
  memory.set("slavikus:program-edit", "true");
  const saved = getWorkouts()[0].exercises;
  assert.equal(saved[0].name, "Подтягивания");
  assert.equal(saved[1].name, "Отжимания с весом");
  assert.deepEqual([saved[1].measure, saved[1].target, saved[1].weight, saved[1].sets], ["weighted", "8", "15", 4]);
  const html = renderProgramScreen();
  assert.equal((html.match(/<span>Вес, кг<\/span>/g) || []).length, 1);
  assert.match(html, /Отжимания с весом/);
  memory.set("slavikus:program-edit", "false");
  assert.match(renderProgramScreen(), /15 кг × 8 повт\./);

  memory.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(workout)));
  assert.equal(getActiveSession().results[1].name, "Отжимания с весом");
  const session = createWorkoutSession({ ...workout, exercises: [saved[1]] });
  addSetResult(session, "15х8");
  assert.equal(formatLogText(session.results), "Отжимания с весом 15х8");
});

test("skipped sets do not become records or the latest completed approach", () => {
  const skipped = { id: "skip", finishedAt: "02.10.2026, 12:00", results: [{ name: "Присед", measure: "repeats", done: ["0"], weights: [""], sets: 1 }] };
  assert.deepEqual(getWorkoutRecords(skipped, [skipped]), []);
  assert.doesNotMatch(formatLogTextWithRecords(skipped, [skipped]), /★/);

  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  const workout = { id: "w1", title: "Тренировка", exercises: [{ name: "Присед", measure: "repeats", target: "10", sets: 1 }] };
  const completed = { id: "done", finishedAt: "01.10.2026, 12:00", results: [{ name: "Присед", measure: "repeats", done: ["12"], weights: [""], sets: 1 }] };
  memory.set("slavikus:user", JSON.stringify({ id: "test" }));
  memory.set("slavikus:workouts", JSON.stringify([workout]));
  memory.set("slavikus:calendar:test", JSON.stringify({ [todayIso()]: "w1" }));
  memory.set("slavikus:log:test", JSON.stringify([skipped, completed]));
  memory.set("slavikus:active-workout", JSON.stringify(createWorkoutSession(workout)));
  const html = renderWorkoutScreen();
  assert.match(html, /Крайний 12/);
  assert.doesNotMatch(html, /Крайний 0/);
});

test("skipped exercises and approaches are absent from saved log entries", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  memory.set("slavikus:user", JSON.stringify({ id: "skip-log-test" }));
  const workout = { id: "mixed", title: "Смешанная", exercises: [
    { name: "Разминка", measure: "completion", target: "", weight: "", sets: 1 },
    { name: "Отжимания с весом", measure: "weighted", target: "8", weight: "15", sets: 3 },
    { name: "Бег", measure: "distanceKm", target: "2", weight: "", sets: 1 }
  ] };
  const session = createWorkoutSession(workout);
  skipSet(session);
  addSetResult(session, "15х8");
  skipSet(session);
  skipSet(session);
  skipSet(session);
  const entry = saveWorkoutToLog(session);
  assert.deepEqual(entry.results.map((result) => result.name), ["Отжимания с весом"]);
  assert.deepEqual(entry.results[0].done, ["8"]);
  assert.deepEqual(entry.results[0].weights, ["15"]);
  assert.equal(entry.results[0].sets, 1);
  assert.equal(entry.text, "Отжимания с весом 15х8");
  assert.equal(getLogEntries().length, 1);

  const allSkipped = createWorkoutSession(workout);
  skipSet(allSkipped);
  for (let index = 0; index < 3; index += 1) skipSet(allSkipped);
  skipSet(allSkipped);
  assert.equal(saveWorkoutToLog(allSkipped), null);
  assert.equal(getLogEntries().length, 1);
});

test("shared workout text includes record stars", async () => {
  let sharedText = "";
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { share: async ({ text }) => { sharedText = text; } }
  });
  const entry = {
    id: "shared",
    title: "Тренировка",
    finishedAt: "02.10.2026, 12:00",
    duration: "00:20:00",
    results: [{ name: "Присед", measure: "repeats", done: ["15"], weights: [""], sets: 1 }]
  };
  await shareWorkout(entry, [entry]);
  assert.match(sharedText, /Присед 15 ★/);
});

test("existing run without a unit becomes a single distance activity", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  const workout = { id: "run", title: "Пробежка", exercises: [{ name: "Бег", target: "10", weight: "", sets: 3 }] };
  memory.set("slavikus:workouts", JSON.stringify([workout]));
  const saved = getWorkouts()[0].exercises[0];
  assert.equal(saved.measure, "distanceKm");
  assert.equal(saved.target, "");
  assert.equal(saved.sets, 1);

  const oldSession = createWorkoutSession(workout);
  memory.set("slavikus:active-workout", JSON.stringify(oldSession));
  const result = getActiveSession().results[0];
  assert.equal(result.measure, "distanceKm");
  assert.equal(result.sets, 1);
});

test("editing an exercise updates its name and unit in saved programs", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  const exercise = getExerciseCatalog().find((item) => item.name === "Бег");
  memory.set("slavikus:workouts", JSON.stringify([{
    id: "run", title: "Пробежка", exercises: [{ name: "Бег", measure: "distanceKm", target: "2", weight: "", sets: 3 }]
  }]));
  updateCatalogExerciseAndWorkouts(exercise, { name: "Спринт", category: "workout", measure: "distanceM" });
  assert.equal(getExerciseCatalog().find((item) => item.id === exercise.id).measure, "distanceM");
  assert.equal(getExerciseCatalog().some((item) => item.name === "Бег"), false);
  assert.deepEqual(getWorkouts()[0].exercises[0], {
    name: "Спринт", measure: "distanceM", target: "", weight: "", time: "", sets: 1
  });
});

test("edited category of a default exercise survives catalog reload", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  const exercise = getExerciseCatalog().find((item) => item.name === "Бег");
  updateCatalogExerciseAndWorkouts(exercise, {
    name: "Бег",
    category: "strength",
    measure: "distanceKm"
  });
  assert.equal(getExerciseCatalog().find((item) => item.id === exercise.id).category, "strength");
  assert.equal(getExerciseCatalog().find((item) => item.id === exercise.id).category, "strength");
});
