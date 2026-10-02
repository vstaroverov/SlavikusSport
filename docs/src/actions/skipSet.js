import { isWorkoutComplete, skipSet } from "../features/workout/workoutRunner.js";
import { getActiveSession, saveActiveSession } from "../features/workout/workoutTimer.js";
import finishWorkout from "./finishWorkout.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";
import { clearRunTrackingData, currentRun, startAutomaticRunTracking, stopAutomaticRunTracking } from "../features/workout/automaticRunTracking.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function skipSetAction(button) {
  const session = getActiveSession();
  if (!session) return;

  const run = currentRun(session);
  try {
    await stopAutomaticRunTracking(session, { collect: false });
  } catch (error) {
    await showConfirmDialog({ title: "GPS ещё записывает", message: error?.message || "Не удалось остановить GPS. Попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
    return;
  }
  if (run) clearRunTrackingData(run);

  skipSet(session);
  session.restStartedAt = Date.now();
  session.restDuration = Number(session.restDuration || 90);

  if (isWorkoutComplete(session)) {
    saveActiveSession(session);
    await finishWorkout();
    return;
  }

  saveActiveSession(session);
  await startAutomaticRunTracking(session);
  saveActiveSession(session);
  dispatchAppChangedKeepingScroll(button);
}
