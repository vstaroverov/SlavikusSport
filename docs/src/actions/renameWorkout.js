import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { getWorkout, renameWorkout } from "../features/program/programStorage.js";
import { showProgramInputDialog } from "../components/ProgramDialog.js";

export default async function renameWorkoutAction(button) {
  const workout = getWorkout(button.dataset.workoutId);
  if (!workout) return;

  const title = await showProgramInputDialog({
    title: "Название тренировки",
    label: "Новое название",
    value: workout.title,
    placeholder: "Например: День ног",
    message: "Название обновится в программе и в календаре.",
    confirmText: "Сохранить",
    returnFocus: button
  });
  if (!title?.trim()) return;

  setActiveWorkoutEditorId(workout.id);
  renameWorkout(workout.id, title.trim());
  window.dispatchEvent(new CustomEvent("app:changed"));
}
