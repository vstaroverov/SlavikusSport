import { exerciseCategories, exerciseMeasures, updateExerciseInCatalog } from "../features/exercises/exercisesStorage.js";
import { showChoiceDialog, showInputDialog } from "../components/InputDialog.js";

export default async function renameCatalogExercise(button) {
  const id = button.dataset.exerciseId;
  const currentName = button.dataset.exerciseName || "";
  const currentCategory = button.dataset.exerciseCategory || "base";
  const currentMeasure = button.dataset.exerciseMeasure || "repeats";
  const name = await showInputDialog({
    title: "Упражнение",
    label: "Новое название",
    value: currentName,
    placeholder: "Название упражнения",
    confirmText: "Далее"
  });
  if (!name?.trim()) return;

  const category = await chooseCategory("Категория упражнения", currentCategory);
  if (!category) return;

  const measure = await chooseMeasure("Единица измерения", currentMeasure);
  if (!measure) return;

  updateExerciseInCatalog(id, name.trim(), category, measure);
  window.dispatchEvent(new Event("app:changed"));
}

function chooseCategory(title, currentCategory) {
  const entries = Object.entries(exerciseCategories);
  return showChoiceDialog({
    title,
    message: "Выбери раздел справочника.",
    choices: entries.map(([id, category]) => ({
      value: id,
      label: category.label,
      caption: id === currentCategory ? "текущая" : ""
    }))
  });
}

function chooseMeasure(title, currentMeasure) {
  const entries = Object.entries(exerciseMeasures);
  return showChoiceDialog({
    title,
    message: "Выбери, как считать результат упражнения.",
    choices: entries.map(([id, measure]) => ({
      value: id,
      label: measure.label,
      caption: id === currentMeasure ? "текущая" : ""
    }))
  });
}
