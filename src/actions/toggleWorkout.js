import { getActiveSession, getElapsedSeconds, saveActiveSession } from "../features/workout/workoutTimer.js";

export default function toggleWorkout() {
  const session = getActiveSession();
  if (!session) return;

  if (session.running) {
    session.elapsed = getElapsedSeconds(session);
    session.running = false;
  } else {
    session.startedAt = Date.now();
    session.running = true;
  }

  saveActiveSession(session);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
