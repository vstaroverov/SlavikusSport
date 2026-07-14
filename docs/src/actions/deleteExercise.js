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
    await showConfirmDialog({
      title: "Не удалено",
      message: "Нельзя удалить последнее упражнение в тренировке.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
    return;
  }

  window.dispatchEvent(new CustomEvent("app:changed"));
}
