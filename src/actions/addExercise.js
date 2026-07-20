import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { addExercise } from "../features/program/programStorage.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default function addExerciseAction(button) {
  setActiveWorkoutEditorId(button.dataset.workoutId);
  addExercise(button.dataset.workoutId);
  dispatchAppChangedKeepingScroll(button);
}
