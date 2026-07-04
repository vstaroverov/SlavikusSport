import { removeWorkoutFromPlan } from "../features/program/calendarPlanner.js";
import { deleteWorkout, getWorkout, getWorkouts } from "../features/program/programStorage.js";

export default function deleteWorkoutAction(button) {
  const workouts = getWorkouts();
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  if (workouts.length <= 1) {
    alert("Нельзя удалить последнюю тренировку.");
    return;
  }

  const confirmed = confirm(`Удалить тренировку "${workout.title}"? Это действие нельзя отменить.`);
  if (!confirmed) return;

  deleteWorkout(workout.id);
  removeWorkoutFromPlan(workout.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
