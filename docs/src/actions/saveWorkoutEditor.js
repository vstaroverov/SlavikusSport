import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { updateExercise } from "../features/program/programStorage.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default function saveWorkoutEditor(button) {
  const workoutId = button.dataset.workoutId;
  const editor = button.closest("[data-workout-editor]");
  if (!workoutId || !editor) return;

  setActiveWorkoutEditorId(workoutId);
  editor.querySelectorAll("[data-change='updateExercise']").forEach((input) => {
    updateExercise(
      input.dataset.workoutId,
      Number(input.dataset.exerciseIndex),
      input.dataset.field,
      input.value
    );
  });

  dispatchAppChangedKeepingScroll(button);
}
