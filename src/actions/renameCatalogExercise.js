import { renameExerciseInCatalog } from "../features/exercises/exercisesStorage.js";

export default function renameCatalogExercise(button) {
  const id = button.dataset.exerciseId;
  const currentName = button.dataset.exerciseName || "";
  const name = prompt("Новое название упражнения", currentName);
  if (!name?.trim()) return;

  renameExerciseInCatalog(id, name.trim());
  window.dispatchEvent(new Event("app:changed"));
}
