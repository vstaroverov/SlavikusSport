import { isWorkoutComplete, skipSet } from "../features/workout/workoutRunner.js";
import { getActiveSession, saveActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout } from "../features/workout/workoutStorage.js";
import { promptWorkoutBackup } from "../features/storage/backupFiles.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default async function skipSetAction(button) {
  const session = getActiveSession();
  if (!session) return;

  skipSet(session);
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
  dispatchAppChangedKeepingScroll(button);
}
