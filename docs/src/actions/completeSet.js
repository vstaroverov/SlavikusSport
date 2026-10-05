import { addSetResult, isWorkoutComplete } from "../features/workout/workoutRunner.js";
import { getActiveSession, saveActiveSession } from "../features/workout/workoutTimer.js";
import finishWorkout from "./finishWorkout.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";
import { getRunTrackerStatus } from "../features/workout/runTracker.js";
import { currentRun, getRunTotals, startAutomaticRunTracking, stopAutomaticRunTracking } from "../features/workout/automaticRunTracking.js";
import { parseDurationInput } from "../features/workout/durationInput.js";

export default async function completeSet(button) {
  const session = getActiveSession();
  if (!session) return;

  const card = button.closest(".current-card");
  const result = session.results[session.currentExercise];
  const isDistance = result.measure === "distanceKm" || result.measure === "distanceM";
  let value = card.querySelector("[data-set-value]")?.value.trim() || "";
  if (isDistance) {
    const run = currentRun(session);
    const tracker = run && session.trackerStarted ? await getRunTrackerStatus() : null;
    const totals = run ? getRunTotals(result, tracker) : null;
    const gpsReady = totals?.meters > 0 && totals?.seconds > 0;
    const distance = gpsReady ? (totals.meters / 1000).toFixed(2) : card.querySelector("[data-distance-value]")?.value || "";
    const seconds = gpsReady ? totals.seconds : parseDurationInput(card.querySelector("[data-duration-value]")?.value || "");
    value = { distance, seconds };
    if (Number(String(distance).replace(",", ".")) <= 0 || seconds <= 0) {
      await showSportFeedbackDialog({
        title: "Нужны дистанция и время",
        message: "Укажи пройденную дистанцию и время: 6 цифр в формате чч:мм:сс.",
        confirmText: "Вернуться к вводу",
        returnFocus: Number(String(distance).replace(",", ".")) <= 0
          ? card.querySelector("[data-distance-value]")
          : card.querySelector("[data-duration-value]")
      });
      return;
    }
    if (run) {
      try {
        await stopAutomaticRunTracking(session);
      } catch (error) {
        await showConfirmDialog({ title: "GPS ещё записывает", message: error?.message || "Не удалось остановить GPS. Попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
        return;
      }
      const finalTotals = getRunTotals(result);
      if (finalTotals.meters > 0 && finalTotals.seconds > 0) {
        value = { distance: (finalTotals.meters / 1000).toFixed(2), seconds: finalTotals.seconds };
      }
    }
  }
  addSetResult(session, value);
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
