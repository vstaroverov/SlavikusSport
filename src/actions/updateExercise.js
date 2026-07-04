import { setActiveWorkoutEditorId } from "../features/program/programEditorState.js";
import { updateExercise } from "../features/program/programStorage.js";

export default function updateExerciseAction(input) {
  setActiveWorkoutEditorId(input.dataset.workoutId);
  updateExercise(
    input.dataset.workoutId,
    Number(input.dataset.exerciseIndex),
    input.dataset.field,
    input.value
  );
}
