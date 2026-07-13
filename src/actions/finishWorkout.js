import { getActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout as saveWorkoutToLog } from "../features/workout/workoutStorage.js";
import { promptWorkoutBackup } from "../features/storage/backupFiles.js";

export default async function finishWorkout() {
  const session = getActiveSession();
  if (!session) return;

  saveWorkoutToLog(session);
  window.location.hash = "#/log";
  window.dispatchEvent(new CustomEvent("app:changed"));
  await promptWorkoutBackup();
}
