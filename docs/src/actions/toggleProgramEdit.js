import { clearActiveWorkoutEditorId, toggleProgramEditMode } from "../features/program/programEditorState.js";

export default function toggleProgramEdit() {
  toggleProgramEditMode();
  clearActiveWorkoutEditorId();
  window.dispatchEvent(new CustomEvent("app:changed"));
}
