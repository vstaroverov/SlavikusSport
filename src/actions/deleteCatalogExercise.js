import { deleteExerciseFromCatalog } from "../features/exercises/exercisesStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function deleteCatalogExercise(button) {
  const confirmed = await showConfirmDialog({
    title: "Удалить из справочника?",
    message: "Упражнение исчезнет из списка доступных упражнений.",
    confirmText: "Удалить"
  });
  if (!confirmed) return;

  deleteExerciseFromCatalog(button.dataset.exerciseId);
  window.dispatchEvent(new Event("app:changed"));
}
