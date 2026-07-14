import { addSetResult, isWorkoutComplete } from "../features/workout/workoutRunner.js";
import { getActiveSession, saveActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout } from "../features/workout/workoutStorage.js";
import { promptWorkoutBackup } from "../features/storage/backupFiles.js";

export default async function completeSet(button) {
  const session = getActiveSession();
  if (!session) return;

  const input = button.closest(".current-card").querySelector("[data-set-value]");
  addSetResult(session, input.value.trim());
  session.restStartedAt = Date.now();
  session.restDuration = Number(session.restDuration || 90);

  if (isWorkoutComplete(session)) {
    finishWorkout(session);
    window.location.hash = "#/log";
    window.dispatchEvent(new CustomEvent("app:changed"));
    await promptWorkoutBackup();
    return;
  }

  saveActiveSession(session);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
