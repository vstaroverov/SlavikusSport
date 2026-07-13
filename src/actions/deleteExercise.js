import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { deleteExercise } from "../features/program/programStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function deleteExerciseAction(button) {
  const confirmed = await showConfirmDialog({
    title: "Удалить упражнение?",
    message: "Упражнение будет удалено из этой тренировки.",
    confirmText: "Удалить"
  });
  if (!confirmed) return;

  setActiveWorkoutEditorId(button.dataset.workoutId);
  const deleted = deleteExercise(button.dataset.workoutId, Number(button.dataset.exerciseIndex));
  if (!deleted) {
    alert("Нельзя удалить последнее упражнение.");
    return;
  }

  window.dispatchEvent(new CustomEvent("app:changed"));
}
