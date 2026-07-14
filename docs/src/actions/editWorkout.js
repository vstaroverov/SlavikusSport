import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";
import { showInputDialog } from "../components/InputDialog.js";

export default async function editWorkout(button) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === button.dataset.workoutId);
  if (!workout) return;

  const current = workout.exercises
    .map((exercise) => `${exercise.name} | ${exercise.target} | ${exercise.sets}`)
    .join("\n");
  const value = await showInputDialog({
    title: "Упражнения",
    label: "Каждое упражнение с новой строки: название | цель | подходы",
    value: current,
    confirmText: "Сохранить",
    multiline: true
  });
  if (!value) return;

  workout.exercises = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, target = "+", sets = "1"] = line.split("|").map((part) => part.trim());
      return {
        name,
        target,
        sets: Math.max(1, Number(sets) || 1)
      };
    });

  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
