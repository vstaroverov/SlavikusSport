import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { deleteExercise } from "../features/program/programStorage.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default async function deleteExerciseAction(button) {
  const confirmed = await showSportFeedbackDialog({
    title: "Удалить упражнение?",
    message: "Упражнение будет удалено из этой тренировки.",
    confirmText: "Удалить",
    cancelText: "Отмена",
    icon: "delete",
    tone: "danger",
    returnFocus: button
  });
  if (!confirmed) return;

  setActiveWorkoutEditorId(button.dataset.workoutId);
  const deleted = deleteExercise(button.dataset.workoutId, Number(button.dataset.exerciseIndex));
  if (!deleted) {
    await showSportFeedbackDialog({
      title: "Не удалено",
      message: "Нельзя удалить последнее упражнение в тренировке.",
      confirmText: "ОК",
      returnFocus: button
    });
    return;
  }

  dispatchAppChangedKeepingScroll(button);
}
