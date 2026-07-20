import { showInputDialog } from "../components/InputDialog.js";
import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { moveExerciseToPosition } from "../features/program/programStorage.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default async function moveExerciseToPositionAction(button) {
  const total = Number(button.dataset.exerciseTotal || 0);
  const currentPosition = Number(button.dataset.exerciseIndex || 0) + 1;
  const value = await showInputDialog({
    title: "Переставить упражнение",
    label: `Новая позиция от 1 до ${total}`,
    value: String(currentPosition),
    placeholder: "Например: 3",
    confirmText: "Переставить"
  });

  if (value === null) return;

  const position = Math.round(Number(String(value).replace(",", ".")));
  if (!Number.isFinite(position) || position < 1 || position > total) return;

  setActiveWorkoutEditorId(button.dataset.workoutId);
  moveExerciseToPosition(button.dataset.workoutId, currentPosition - 1, position);
  dispatchAppChangedKeepingScroll(button);
}
