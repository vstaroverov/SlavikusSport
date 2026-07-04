import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";

export default function addWorkout() {
  const title = prompt("Название тренировки");
  if (!title?.trim()) return;

  const workouts = getWorkouts();
  workouts.push({
    id: crypto.randomUUID(),
    title: stripWorkoutPrefix(title.trim()),
    shortName: `Т${workouts.length + 1}`,
    exercises: [{ name: "Новое упражнение", target: "10 x 3", weight: "", sets: 3 }]
  });
  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function stripWorkoutPrefix(title) {
  return title.replace(/^Т\d+\.\s*/i, "");
}
