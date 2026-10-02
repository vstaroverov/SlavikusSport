import { addExerciseToCatalog } from "../features/exercises/exercisesStorage.js";
import { showExerciseCatalogDialog } from "../components/ExerciseCatalogDialog.js";

export default async function addCatalogExercise(button) {
  const details = await showExerciseCatalogDialog({ returnFocus: button });
  if (!details) return;

  addExerciseToCatalog(details.name, details.category, details.measure);
  window.dispatchEvent(new Event("app:changed"));
}
