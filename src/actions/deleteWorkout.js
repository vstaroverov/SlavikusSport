import { removeWorkoutFromPlan } from "../features/program/calendarPlanner.js";
import { deleteWorkout, getWorkout, getWorkouts } from "../features/program/programStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function deleteWorkoutAction(button) {
  const workouts = getWorkouts();
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  if (workouts.length <= 1) {
    await showConfirmDialog({
      title: "Не удалено",
      message: "Нельзя удалить последнюю тренировку.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
    return;
  }

  const confirmed = await showConfirmDialog({
    title: "Удалить тренировку?",
    message: `"${workout.title}" будет удалена из программы и календаря.`,
    confirmText: "Удалить"
  });
  if (!confirmed) return;

  deleteWorkout(workout.id);
  removeWorkoutFromPlan(workout.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
