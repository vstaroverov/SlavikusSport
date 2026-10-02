import { getPlan, removeWorkoutFromPlan } from "../features/program/calendarPlanner.js";
import { deleteWorkout, getWorkout, getWorkouts } from "../features/program/programStorage.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";

export default async function deleteWorkoutAction(button) {
  const workouts = getWorkouts();
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  if (workouts.length <= 1) {
    await showSportFeedbackDialog({
      title: "Не удалено",
      message: "Нельзя удалить последнюю тренировку.",
      confirmText: "ОК",
      returnFocus: button
    });
    return;
  }

  const plannedDays = Object.values(getPlan()).filter((id) => id === workout.id).length;
  const confirmed = await showSportFeedbackDialog({
    title: "Удалить тренировку?",
    message: "Тренировка и её назначения в календаре будут удалены.",
    confirmText: "Удалить тренировку",
    cancelText: "Отмена",
    subjectTitle: workout.title,
    subjectMeta: `${workout.exercises.length} ${plural(workout.exercises.length, "упражнение", "упражнения", "упражнений")} · ${plannedDays} ${plural(plannedDays, "день", "дня", "дней")} в календаре`,
    icon: "delete",
    tone: "danger",
    className: "vsg-sport-program-delete-dialog",
    returnFocus: button
  });
  if (!confirmed) return;

  deleteWorkout(workout.id);
  removeWorkoutFromPlan(workout.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
}
