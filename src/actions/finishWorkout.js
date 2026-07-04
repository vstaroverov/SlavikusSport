import { getActiveSession } from "../features/workout/workoutTimer.js";
import { finishWorkout as saveWorkoutToLog } from "../features/workout/workoutStorage.js";

export default function finishWorkout() {
  const session = getActiveSession();
  if (!session) return;

  saveWorkoutToLog(session);
  window.location.hash = "#/log";
  window.dispatchEvent(new CustomEvent("app:changed"));
}
