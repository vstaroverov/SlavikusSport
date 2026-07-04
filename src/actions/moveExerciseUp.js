import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { moveExercise } from "../features/program/programStorage.js";

export default function moveExerciseUp(button) {
  setActiveWorkoutEditorId(button.dataset.workoutId);
  moveExercise(button.dataset.workoutId, Number(button.dataset.exerciseIndex), -1);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
