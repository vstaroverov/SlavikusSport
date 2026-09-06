import { exerciseMeasures } from "../features/exercises/exercisesStorage.js";

export function renderExerciseList(exercises, currentIndex = -1) {
  return `
    <div class="exercise-list">
      ${exercises.map((exercise, index) => `
        <div class="exercise-row ${index === currentIndex ? "current" : ""}">
          <span>${index + 1}. ${escapeHtml(exercise.name)}</span>
          <strong>${escapeHtml(formatExerciseMeta(exercise))}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function formatExerciseMeta(exercise) {
  const measure = exerciseMeasures[exercise.measure]?.shortLabel || "";
  return [
    exercise.sets ? `${exercise.sets} подх.` : "",
    exercise.target,
    exercise.weight,
    measure
  ].filter(Boolean).join(" · ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
