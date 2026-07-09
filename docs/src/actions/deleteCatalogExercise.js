import { deleteExerciseFromCatalog } from "../features/exercises/exercisesStorage.js";

export default function deleteCatalogExercise(button) {
  const confirmed = confirm("Удалить упражнение из списка?");
  if (!confirmed) return;

  deleteExerciseFromCatalog(button.dataset.exerciseId);
  window.dispatchEvent(new Event("app:changed"));
}
