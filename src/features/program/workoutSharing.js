import { addExerciseToCatalog, exerciseMeasures, getExerciseCatalog } from "../exercises/exercisesStorage.js";
import { getWorkouts, saveWorkouts } from "./programStorage.js";

const KIND = "workout-share";
export const MAX_SHARE_FILE_BYTES = 1024 * 1024;
const MAX_WORKOUTS = 100;
const MAX_EXERCISES = 100;

function cleanText(value, maxLength) {
  if (typeof value !== "string") throw new Error("Некорректные данные тренировки.");
  const result = value.trim();
  if (!result || result.length > maxLength) throw new Error("Некорректные данные тренировки.");
  return result;
}

function cleanField(value) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" && typeof value !== "number") throw new Error("Некорректные параметры упражнения.");
  const result = String(value).trim();
  if (result.length > 100) throw new Error("Некорректные параметры упражнения.");
  return result;
}

function cleanExercise(exercise) {
  if (!exercise || typeof exercise !== "object" || Array.isArray(exercise)) throw new Error("Некорректное упражнение.");
  if (!Object.hasOwn(exerciseMeasures, exercise.measure)) throw new Error("Неизвестная единица измерения упражнения.");
  return {
    name: cleanText(exercise.name, 120),
    measure: exercise.measure,
    target: cleanField(exercise.target),
    weight: cleanField(exercise.weight),
    sets: cleanField(exercise.sets),
    time: cleanField(exercise.time)
  };
}

function cleanWorkout(workout) {
  if (!workout || typeof workout !== "object" || Array.isArray(workout)) throw new Error("Некорректная тренировка.");
  if (!Array.isArray(workout.exercises) || workout.exercises.length > MAX_EXERCISES) throw new Error("Некорректный список упражнений.");
  return {
    title: cleanText(workout.title, 120),
    exercises: workout.exercises.map(cleanExercise)
  };
}

export function createWorkoutShare(workouts, selectedIds) {
  const ids = new Set(selectedIds);
  const selected = workouts.filter((workout) => ids.has(workout.id));
  if (!selected.length) throw new Error("Выберите хотя бы одну тренировку.");
  if (selected.length > MAX_WORKOUTS) throw new Error("Слишком много тренировок для одного файла.");
  const document = {
    app: "Slavikus Sport",
    kind: KIND,
    version: 1,
    exportedAt: new Date().toISOString(),
    workouts: selected.map(cleanWorkout)
  };
  if (new Blob([JSON.stringify(document)]).size > MAX_SHARE_FILE_BYTES) {
    throw new Error("Слишком много данных для одного файла. Выбери меньше тренировок.");
  }
  return document;
}

export function parseWorkoutShare(text) {
  if (typeof text !== "string" || new Blob([text]).size > MAX_SHARE_FILE_BYTES) throw new Error("Файл слишком большой.");
  let document;
  try { document = JSON.parse(text); } catch { throw new Error("Файл не является корректным JSON."); }
  if (document?.app !== "Slavikus Sport" || document.kind !== KIND || document.version !== 1) {
    throw new Error("Выберите файл с тренировками Slavikus Sport.");
  }
  if (!Array.isArray(document.workouts) || !document.workouts.length || document.workouts.length > MAX_WORKOUTS) {
    throw new Error("В файле нет подходящих тренировок.");
  }
  return document.workouts.map(cleanWorkout);
}

export function importSharedWorkouts(text) {
  const imported = parseWorkoutShare(text).map((workout) => ({ ...workout, id: crypto.randomUUID() }));
  const known = new Set(getExerciseCatalog().map((exercise) => exercise.name.toLocaleLowerCase("ru-RU")));
  for (const workout of imported) {
    for (const exercise of workout.exercises) {
      const key = exercise.name.toLocaleLowerCase("ru-RU");
      if (known.has(key)) continue;
      addExerciseToCatalog(exercise.name, "base", exercise.measure);
      known.add(key);
    }
  }
  saveWorkouts([...getWorkouts(), ...imported]);
  return imported.length;
}
