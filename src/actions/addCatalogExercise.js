import { addExerciseToCatalog } from "../features/exercises/exercisesStorage.js";

export default function addCatalogExercise() {
  const name = prompt("Название упражнения");
  if (!name?.trim()) return;

  addExerciseToCatalog(name.trim());
  window.dispatchEvent(new Event("app:changed"));
}
