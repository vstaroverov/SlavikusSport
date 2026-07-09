import { addExerciseToCatalog, exerciseCategories } from "../features/exercises/exercisesStorage.js";

export default function addCatalogExercise() {
  const name = prompt("Название упражнения");
  if (!name?.trim()) return;

  const category = chooseCategory("Категория упражнения", "base");
  if (!category) return;

  addExerciseToCatalog(name.trim(), category);
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
