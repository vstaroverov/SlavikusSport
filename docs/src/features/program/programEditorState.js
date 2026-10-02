import { appStorage } from "../storage/persistentStorage.js";
const EDIT_KEY = "slavikus:program-edit";
const ACTIVE_WORKOUT_KEY = "slavikus:program-active-workout";

export function isProgramEditMode() {
  return appStorage.getItem(EDIT_KEY) === "true";
}

export function toggleProgramEditMode() {
  appStorage.setItem(EDIT_KEY, String(!isProgramEditMode()));
}

export function getActiveWorkoutEditorId() {
  return appStorage.getItem(ACTIVE_WORKOUT_KEY);
}

export function setActiveWorkoutEditorId(workoutId) {
  appStorage.setItem(ACTIVE_WORKOUT_KEY, workoutId);
}

export function clearActiveWorkoutEditorId() {
  appStorage.removeItem(ACTIVE_WORKOUT_KEY);
}
