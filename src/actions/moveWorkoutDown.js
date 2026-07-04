import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { moveWorkout } from "../features/program/programStorage.js";

export default function moveWorkoutDown(button) {
  setActiveWorkoutEditorId(button.dataset.workoutId);
  moveWorkout(button.dataset.workoutId, 1);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
