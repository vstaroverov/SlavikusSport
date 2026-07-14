import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { getWorkout, renameWorkout } from "../features/program/programStorage.js";
import { showInputDialog } from "../components/InputDialog.js";

export default async function renameWorkoutAction(button) {
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  const title = await showInputDialog({
    title: "Название тренировки",
    label: "Новое название",
    value: workout.title,
    placeholder: "Например: День ног",
    confirmText: "Сохранить"
  });
  if (!title?.trim()) return;

  setActiveWorkoutEditorId(workout.id);
  renameWorkout(workout.id, title.trim());
  window.dispatchEvent(new CustomEvent("app:changed"));
}
