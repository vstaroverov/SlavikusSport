import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession } from "../features/workout/workoutRunner.js";
import { saveActiveSession } from "../features/workout/workoutTimer.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function startWorkout() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));
  if (!workout) {
    await showConfirmDialog({
      title: "Тренировка не назначена",
      message: "Создай программу или выбери тренировку в календаре.",
      confirmText: "Открыть программу",
      cancelText: "Позже",
      danger: false
    }).then((confirmed) => {
      if (confirmed) window.location.hash = "#/program";
    });
    return;
  }

  saveActiveSession(createWorkoutSession(workout));
  window.dispatchEvent(new CustomEvent("app:changed"));
}
