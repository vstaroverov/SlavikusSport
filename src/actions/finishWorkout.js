import { getActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout as saveWorkoutToLog } from "../features/workout/workoutStorage.js";
import { promptWorkoutBackup } from "../features/storage/backupFiles.js";
import { getLogEntries } from "../features/log/logStorage.js";
import { showWorkoutCelebrationDialog } from "../components/WorkoutCelebrationDialog.js";

export default async function finishWorkout() {
  const session = getActiveSession();
  if (!session) return;

  const entry = saveWorkoutToLog(session);
  await showWorkoutCelebrationDialog(entry, getLogEntries());
  window.location.hash = "#/log";
  window.dispatchEvent(new CustomEvent("app:changed"));
  await promptWorkoutBackup();
}
