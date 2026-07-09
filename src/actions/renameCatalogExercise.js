import { exerciseCategories, updateExerciseInCatalog } from "../features/exercises/exercisesStorage.js";

export default function renameCatalogExercise(button) {
  const id = button.dataset.exerciseId;
  const currentName = button.dataset.exerciseName || "";
  const currentCategory = button.dataset.exerciseCategory || "base";
  const name = prompt("Новое название упражнения", currentName);
  if (!name?.trim()) return;

  const category = chooseCategory("Категория упражнения", currentCategory);
  if (!category) return;

  updateExerciseInCatalog(id, name.trim(), category);
  window.dispatchEvent(new Event("app:changed"));
}

function chooseCategory(title, currentCategory) {
  const entries = Object.entries(exerciseCategories);
  const currentIndex = Math.max(1, entries.findIndex(([id]) => id === currentCategory) + 1);
  const message = `${title}\n${entries.map(([, category], index) => `${index + 1}. ${category.label}`).join("\n")}`;
  const value = prompt(message, String(currentIndex));
  if (value === null) return null;

  const index = Number(value) - 1;
  return entries[index]?.[0] || "base";
}
