import { getActiveSession, getElapsedSeconds, saveActiveSession } from "../features/workout/workoutTimer.js";
import { startAutomaticRunTracking, stopAutomaticRunTracking } from "../features/workout/automaticRunTracking.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

let toggling = false;

export default async function toggleWorkout(button) {
  if (toggling) return;
  toggling = true;
  if (button) button.disabled = true;
  try {
    const session = getActiveSession();
    if (!session) return;

    if (session.running) {
      try {
        await stopAutomaticRunTracking(session);
      } catch (error) {
        await showConfirmDialog({ title: "GPS ещё записывает", message: error?.message || "Не удалось остановить GPS. Попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
        return;
      }
      session.elapsed = getElapsedSeconds(session);
      session.running = false;
    } else {
      session.startedAt = Date.now();
      session.running = true;
      await startAutomaticRunTracking(session);
      session.startedAt = Date.now();
    }

    saveActiveSession(session);
    window.dispatchEvent(new CustomEvent("app:changed"));
  } finally {
    toggling = false;
    if (button?.isConnected) button.disabled = false;
  }
}
