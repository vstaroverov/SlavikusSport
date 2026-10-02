import {
  exerciseMeasures,
  getExerciseCatalog,
  updateExerciseInCatalog
} from "../features/exercises/exercisesStorage.js";
import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";
import { getActiveSession, saveActiveSession } from "../features/workout/workoutTimer.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";
import { showExerciseCatalogDialog } from "../components/ExerciseCatalogDialog.js";

export default async function renameCatalogExercise(button) {
  const exercise = getExerciseCatalog().find((item) => item.id === button.dataset.exerciseId);
  if (!exercise) return;

  const details = await showExerciseCatalogDialog({ exercise, returnFocus: button });
  if (!details) return;

  try {
    updateCatalogExerciseAndWorkouts(exercise, details);
    window.dispatchEvent(new Event("app:changed"));
  } catch (error) {
    await showSportFeedbackDialog({
      title: "Не удалось сохранить упражнение",
      message: error.message,
      confirmText: "ОК",
      returnFocus: button
    });
  }
}

export function updateCatalogExerciseAndWorkouts(exercise, details) {
  const name = String(details.name || "").trim();
  const category = details.category;
  const measure = details.measure;
  if (!name) throw new Error("Введи название упражнения.");
  if (!exerciseMeasures[measure]) throw new Error("Выбери единицу измерения.");

  const catalog = getExerciseCatalog();
  if (catalog.some((item) => item.id !== exercise.id && normalizeName(item.name) === normalizeName(name))) {
    throw new Error("Упражнение с таким названием уже есть.");
  }

  const session = getActiveSession();
  updateExerciseInCatalog(exercise.id, name, category, measure);

  const measureChanged = exercise.measure !== measure;
  const workouts = getWorkouts();
  let changed = false;
  const updated = workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((item) => {
      if (normalizeName(item.name) !== normalizeName(exercise.name)) return item;
      changed = true;
      return {
        ...item,
        name,
        measure,
        ...(measureChanged ? { target: "", weight: "", time: "", sets: isDistance(measure) || measure === "completion" ? 1 : item.sets } : {})
      };
    })
  }));
  if (changed) saveWorkouts(updated);
  if (session?.results?.length) {
    let sessionChanged = false;
    session.results.forEach((result) => {
      if (normalizeName(result.name) !== normalizeName(exercise.name)) return;
      result.name = name;
      if (!result.done?.length) {
        result.measure = measure;
        if (measureChanged) {
          result.target = "";
          result.weight = "";
          if (isDistance(measure) || measure === "completion") result.sets = 1;
        }
      }
      sessionChanged = true;
    });
    if (sessionChanged) saveActiveSession(session);
  }
}

function isDistance(measure) {
  return measure === "distanceKm" || measure === "distanceM";
}

function normalizeName(name) {
  return String(name || "").trim().toLocaleLowerCase("ru-RU");
}
