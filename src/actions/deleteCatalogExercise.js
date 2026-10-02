import { deleteExerciseFromCatalog, exerciseCategories, exerciseMeasures, getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";

export default async function deleteCatalogExercise(button) {
  const exercise = getExerciseCatalog().find((item) => item.id === button.dataset.exerciseId);
  if (!exercise) return;
  const confirmed = await showSportFeedbackDialog({
    title: "Удалить упражнение?",
    message: "Упражнение исчезнет из справочника для новых тренировок.",
    confirmText: "Удалить упражнение",
    cancelText: "Отмена",
    subjectTitle: exercise.name,
    subjectMeta: `${exerciseMeasures[exercise.measure]?.label || exerciseMeasures.repeats.label} · ${exerciseCategories[exercise.category]?.label || exerciseCategories.base.label}`,
    icon: "delete",
    tone: "danger",
    className: "vsg-sport-catalog-delete-dialog",
    returnFocus: button
  });
  if (!confirmed) return;

  deleteExerciseFromCatalog(button.dataset.exerciseId);
  window.dispatchEvent(new Event("app:changed"));
}
