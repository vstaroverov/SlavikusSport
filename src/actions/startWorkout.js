import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession } from "../features/workout/workoutRunner.js";
import { saveActiveSession } from "../features/workout/workoutTimer.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { currentRun, startAutomaticRunTracking } from "../features/workout/automaticRunTracking.js";

let starting = false;

export default async function startWorkout(button) {
  if (starting) return;
  starting = true;
  if (button) button.disabled = true;
  try {
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

    const session = createWorkoutSession(workout);
    saveActiveSession(session);
    if (currentRun(session)) {
      await startAutomaticRunTracking(session);
      session.startedAt = Date.now();
      saveActiveSession(session);
    }
    window.dispatchEvent(new CustomEvent("app:changed"));
  } finally {
    starting = false;
    if (button?.isConnected) button.disabled = false;
  }
}
