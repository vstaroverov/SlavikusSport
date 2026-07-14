import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";

export default function copyWorkout(button) {
  const workoutId = button.dataset.workoutId;
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  workouts.push({
    ...structuredClone(workout),
    id: crypto.randomUUID(),
    title: `${stripCopySuffix(workout.title)} копия`,
    shortName: `Т${workouts.length + 1}`,
    exercises: workout.exercises.map((exercise) => ({ ...exercise }))
  });

  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function stripCopySuffix(title) {
  return String(title || "").replace(/\s+копия$/i, "").trim();
}
