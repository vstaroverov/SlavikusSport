import { appStorage } from "../storage/persistentStorage.js";
import { getExerciseCatalog, getExerciseMeasure, getWeightedVariantName, hasAddedWeight, isDistanceMeasure } from "../exercises/exercisesStorage.js";

const WORKOUTS_KEY = "slavikus:workouts";
const WORKOUTS_VERSION_KEY = "slavikus:workouts-version";
const WORKOUTS_VERSION = "2026-07-empty-program-1";

const starterWorkouts = [];

export function seedInitialData() {
  if (!appStorage.getItem(WORKOUTS_KEY)) {
    appStorage.setItem(WORKOUTS_KEY, JSON.stringify(starterWorkouts));
  }

  appStorage.setItem(WORKOUTS_VERSION_KEY, WORKOUTS_VERSION);
}

export function getWorkouts() {
  const workouts = JSON.parse(appStorage.getItem(WORKOUTS_KEY) || "[]");
  const normalized = normalizeWeightedVariants(normalizeCompletionPlans(normalizeSecondsPlans(normalizeDistancePlans(normalizeMissingMeasures(workouts)))));
  if (JSON.stringify(normalized) !== JSON.stringify(workouts)) appStorage.setItem(WORKOUTS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function saveWorkouts(workouts) {
  const numberedWorkouts = normalizeWeightedVariants(normalizeCompletionPlans(normalizeSecondsPlans(normalizeMissingMeasures(workouts)))).map((workout, index) => ({
    ...workout,
    shortName: `Т${index + 1}`
  }));
  appStorage.setItem(WORKOUTS_KEY, JSON.stringify(numberedWorkouts));
}

function normalizeMissingMeasures(workouts) {
  if (!workouts.some((workout) => workout.exercises?.some((exercise) => !exercise.measure))) return workouts;
  const catalog = new Map(getExerciseCatalog().map((exercise) => [exercise.name.trim().toLocaleLowerCase("ru-RU"), exercise]));
  return workouts.map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => {
      if (exercise.measure) return exercise;
      const catalogExercise = catalog.get(String(exercise.name || "").trim().toLocaleLowerCase("ru-RU"));
      const measure = getExerciseMeasure(catalogExercise || exercise);
      const generatedDistance = (measure === "distanceKm" || measure === "distanceM")
        && String(exercise.target) === "10" && Number(exercise.sets) === 3 && !exercise.weight;
      return {
        ...exercise,
        measure,
        ...(generatedDistance ? { target: "", sets: 1 } : {})
      };
    })
  }));
}

function normalizeDistancePlans(workouts) {
  return workouts.map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => isDistanceMeasure(exercise.measure)
      ? { ...exercise, weight: "", sets: 1 }
      : exercise)
  }));
}

function normalizeSecondsPlans(workouts) {
  return workouts.map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => {
      if (exercise.measure !== "seconds" && String(exercise.name || "").trim().toLocaleLowerCase("ru-RU") !== "вис") return exercise;
      const target = String(exercise.target || "").trim()
        .replace(/^\d+(?:[.,]\d+)?\s*[xх]\s*(\d+)$/i, "$1")
        .replace(/\s*(?:с|сек|секунд|секунды)$/i, "");
      return { ...exercise, measure: "seconds", target, weight: "" };
    })
  }));
}

function normalizeCompletionPlans(workouts) {
  const completionNames = new Set(getExerciseCatalog()
    .filter((exercise) => exercise.measure === "completion")
    .map((exercise) => exercise.name.trim().toLocaleLowerCase("ru-RU")));
  return workouts.map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => (
      exercise.measure === "completion" || completionNames.has(String(exercise.name || "").trim().toLocaleLowerCase("ru-RU"))
        ? { ...exercise, measure: "completion", target: "", weight: "", time: "", sets: 1 }
        : exercise
    ))
  }));
}

function normalizeWeightedVariants(workouts) {
  return workouts.map((workout) => ({
    ...workout,
    exercises: (workout.exercises || []).map((exercise) => {
      const name = getWeightedVariantName(exercise.name);
      return name && (exercise.measure === "weighted" || hasAddedWeight(exercise))
        ? { ...exercise, name, measure: "weighted" }
        : exercise;
    })
  }));
}

export function getWorkout(id) {
  return getWorkouts().find((workout) => workout.id === id);
}

export function renameWorkout(id, title) {
  const workouts = getWorkouts().map((workout) => {
    if (workout.id !== id) return workout;
    return { ...workout, title: stripWorkoutPrefix(title) };
  });
  saveWorkouts(workouts);
}

export function deleteWorkout(id) {
  const workouts = getWorkouts().filter((workout) => workout.id !== id);
  saveWorkouts(workouts);
}

export function moveWorkout(id, direction) {
  const workouts = getWorkouts();
  const index = workouts.findIndex((workout) => workout.id === id);
  const nextIndex = index + direction;

  if (index < 0 || nextIndex < 0 || nextIndex >= workouts.length) {
    return;
  }

  const [workout] = workouts.splice(index, 1);
  workouts.splice(nextIndex, 0, workout);
  saveWorkouts(workouts);
}

export function addExercise(workoutId) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  const catalogExercise = getExerciseCatalog()[0];
  workout.exercises.push({
    name: catalogExercise?.name || "Упражнение",
    measure: getExerciseMeasure(catalogExercise),
    target: "",
    weight: "",
    sets: isDistanceMeasure(getExerciseMeasure(catalogExercise)) || getExerciseMeasure(catalogExercise) === "completion" ? 1 : "",
    time: ""
  });
  saveWorkouts(workouts);
}

export function updateExercise(workoutId, exerciseIndex, field, value) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  const exerciseItem = workout?.exercises[exerciseIndex];
  if (!exerciseItem) return;

  if (field === "sets") {
    exerciseItem.sets = value === "" ? "" : Math.max(1, Number(value) || 1);
  } else if (field === "weight") {
    exerciseItem.weight = value.trim();
  } else if (field === "name") {
    const name = value.trim() || "Упражнение";
    const catalogExercise = getExerciseCatalog().find((exercise) => exercise.name === name);
    const previousMeasure = exerciseItem.measure;
    exerciseItem.name = name;
    exerciseItem.measure = getExerciseMeasure(catalogExercise || exerciseItem);
    if (exerciseItem.measure !== previousMeasure) {
      exerciseItem.target = "";
      exerciseItem.weight = "";
      exerciseItem.time = "";
    }
    if (isDistanceMeasure(exerciseItem.measure) || exerciseItem.measure === "completion") exerciseItem.sets = 1;
  } else {
    exerciseItem[field] = value.trim() || "";
  }

  saveWorkouts(workouts);
}

export function deleteExercise(workoutId, exerciseIndex) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout || workout.exercises.length <= 1) return false;

  workout.exercises.splice(exerciseIndex, 1);
  saveWorkouts(workouts);
  return true;
}

export function moveExercise(workoutId, exerciseIndex, direction) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  const nextIndex = exerciseIndex + direction;
  if (exerciseIndex < 0 || nextIndex < 0 || nextIndex >= workout.exercises.length) {
    return;
  }

  const [exerciseItem] = workout.exercises.splice(exerciseIndex, 1);
  workout.exercises.splice(nextIndex, 0, exerciseItem);
  saveWorkouts(workouts);
}

export function moveExerciseToPosition(workoutId, exerciseIndex, position) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  const nextIndex = Math.max(0, Math.min(Number(position) - 1, workout.exercises.length - 1));
  if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length || nextIndex === exerciseIndex) {
    return;
  }

  const [exerciseItem] = workout.exercises.splice(exerciseIndex, 1);
  workout.exercises.splice(nextIndex, 0, exerciseItem);
  saveWorkouts(workouts);
}

function stripWorkoutPrefix(title) {
  return String(title).trim().replace(/^Т\d+\.\s*/i, "").replace(/^T\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}
