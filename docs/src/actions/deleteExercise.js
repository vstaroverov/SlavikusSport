import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { deleteExercise } from "../features/program/programStorage.js";

export default function deleteExerciseAction(button) {
  const confirmed = confirm("Удалить упражнение из тренировки?");
  if (!confirmed) return;

  setActiveWorkoutEditorId(button.dataset.workoutId);
  const deleted = deleteExercise(button.dataset.workoutId, Number(button.dataset.exerciseIndex));
  if (!deleted) {
    alert("Нельзя удалить последнее упражнение.");
    return;
  }

  window.dispatchEvent(new CustomEvent("app:changed"));
}
