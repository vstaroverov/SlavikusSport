import { clearActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { updateExercise } from "../features/program/programStorage.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";
import { waitForPendingWrites } from "../features/storage/persistentStorage.js";

export default async function saveWorkoutEditor(button) {
  const workoutId = button.dataset.workoutId;
  const editor = button.closest("[data-workout-editor]");
  if (!workoutId || !editor) return;

  const invalid = [...editor.querySelectorAll("[data-change='updateExercise']")]
    .find((input) => !input.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    return;
  }

  button.disabled = true;
  button.textContent = "Сохраняем…";
  try {
    editor.querySelectorAll("[data-change='updateExercise']").forEach((input) => {
      updateExercise(
        input.dataset.workoutId,
        Number(input.dataset.exerciseIndex),
        input.dataset.field,
        input.value
      );
    });
    await waitForPendingWrites();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Сохранить";
    showSportFeedbackDialog({
      title: "Не удалось сохранить тренировку",
      message: error?.message || "Проверь данные и попробуй ещё раз.",
      confirmText: "Вернуться к редактированию",
      tone: "danger",
      returnFocus: button
    });
    return;
  }

  clearActiveWorkoutEditorId();
  dispatchAppChangedKeepingScroll(button);
  const card = [...document.querySelectorAll("[data-program-workout-id]")]
    .find((item) => item.dataset.programWorkoutId === workoutId);
  showSportFeedbackDialog({
    title: "Тренировка сохранена",
    message: "Изменения в программе применены.",
    confirmText: "Готово",
    icon: "check",
    returnFocus: card?.querySelector("summary")
  });
}
