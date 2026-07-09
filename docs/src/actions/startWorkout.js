import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession } from "../features/workout/workoutRunner.js";
import { saveActiveSession } from "../features/workout/workoutTimer.js";

export default function startWorkout() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));
  if (!workout) {
    alert("Сегодня день отдыха. Назначь тренировку в календаре, чтобы начать.");
    return;
  }

  saveActiveSession(createWorkoutSession(workout));
  window.dispatchEvent(new CustomEvent("app:changed"));
}
