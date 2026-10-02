import { getActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout as saveWorkoutToLog } from "../features/workout/workoutStorage.js";
import { promptWorkoutBackup } from "../features/storage/backupFiles.js";
import { getLogEntries } from "../features/log/logStorage.js";
import { showWorkoutCelebrationDialog } from "../components/WorkoutCelebrationDialog.js";
import { addSetResult } from "../features/workout/workoutRunner.js";
import { currentRun, getRunTotals, stopAutomaticRunTracking } from "../features/workout/automaticRunTracking.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";

export default async function finishWorkout() {
  const session = getActiveSession();
  if (!session) return;

  const run = currentRun(session);
  try {
    await stopAutomaticRunTracking(session);
  } catch (error) {
    await showConfirmDialog({ title: "GPS ещё записывает", message: error?.message || "Не удалось остановить GPS. Попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
    return;
  }
  const totals = getRunTotals(run);
  if (run && !run.done?.length && totals.meters > 0 && totals.seconds > 0) {
    addSetResult(session, { distance: (totals.meters / 1000).toFixed(2), seconds: totals.seconds });
  }

  const entry = saveWorkoutToLog(session);
  if (!entry) {
    await showSportFeedbackDialog({
      title: "Нет выполненных упражнений",
      message: "Все упражнения пропущены, поэтому запись в лог не добавлена.",
      confirmText: "Понятно"
    });
    window.location.hash = "#/log";
    window.dispatchEvent(new CustomEvent("app:changed"));
    return;
  }
  await showWorkoutCelebrationDialog(entry, getLogEntries());
  window.location.hash = "#/log";
  window.dispatchEvent(new CustomEvent("app:changed"));
  await promptWorkoutBackup();
}
