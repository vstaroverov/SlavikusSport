import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { addExercise } from "../features/program/programStorage.js";

export default function addExerciseAction(button) {
  setActiveWorkoutEditorId(button.dataset.workoutId);
  addExercise(button.dataset.workoutId);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
