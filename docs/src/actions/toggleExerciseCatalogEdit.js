import { toggleExerciseCatalogEditMode } from "../features/exercises/exercisesStorage.js";

export default function toggleExerciseCatalogEdit() {
  toggleExerciseCatalogEditMode();
  window.dispatchEvent(new Event("app:changed"));
}
