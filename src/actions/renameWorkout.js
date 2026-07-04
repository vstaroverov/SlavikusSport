import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { getWorkout, renameWorkout } from "../features/program/programStorage.js";

export default function renameWorkoutAction(button) {
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  const title = prompt("Новое название тренировки", workout.title);
  if (!title?.trim()) return;

  setActiveWorkoutEditorId(workout.id);
  renameWorkout(workout.id, title.trim());
  window.dispatchEvent(new CustomEvent("app:changed"));
}
