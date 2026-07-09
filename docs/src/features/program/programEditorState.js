const EDIT_KEY = "slavikus:program-edit";
const ACTIVE_WORKOUT_KEY = "slavikus:program-active-workout";

export function isProgramEditMode() {
  return localStorage.getItem(EDIT_KEY) === "true";
}

export function toggleProgramEditMode() {
  localStorage.setItem(EDIT_KEY, String(!isProgramEditMode()));
}

export function getActiveWorkoutEditorId() {
  return localStorage.getItem(ACTIVE_WORKOUT_KEY);
}

export function setActiveWorkoutEditorId(workoutId) {
  localStorage.setItem(ACTIVE_WORKOUT_KEY, workoutId);
}

export function clearActiveWorkoutEditorId() {
  localStorage.removeItem(ACTIVE_WORKOUT_KEY);
}
