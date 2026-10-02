import { getExerciseCatalog, getExerciseMeasure } from "../features/exercises/exercisesStorage.js";
import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";
import { showProgramInputDialog } from "../components/ProgramDialog.js";

export default async function addWorkout(button) {
  const title = await showProgramInputDialog({
    title: "Новая тренировка",
    label: "Название",
    placeholder: "Например: День ног",
    message: "Дай тренировке название. Упражнения можно изменить после создания.",
    mark: "+",
    confirmText: "Создать",
    returnFocus: button
  });
  if (!title?.trim()) return;

  const workouts = getWorkouts();
  const exercise = getExerciseCatalog()[0];
  const measure = getExerciseMeasure(exercise);
  const distance = measure === "distanceKm" || measure === "distanceM";

  workouts.push({
    id: crypto.randomUUID(),
    title: stripWorkoutPrefix(title.trim()),
    shortName: `Т${workouts.length + 1}`,
    exercises: [{
      name: exercise?.name || "Упражнение",
      measure,
      target: distance ? "" : "10",
      weight: "",
      sets: distance ? 1 : 3,
      time: ""
    }]
  });

  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function stripWorkoutPrefix(title) {
  return title.replace(/^Т\d+\.\s*/i, "");
}
