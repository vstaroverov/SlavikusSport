import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { updateExercise } from "../features/program/programStorage.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default function updateExerciseAction(input) {
  if (!input.checkValidity()) {
    input.reportValidity();
    return;
  }
  setActiveWorkoutEditorId(input.dataset.workoutId);
  updateExercise(
    input.dataset.workoutId,
    Number(input.dataset.exerciseIndex),
    input.dataset.field,
    input.value
  );
  if (input.dataset.field === "name") dispatchAppChangedKeepingScroll(input);
}
