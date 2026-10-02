import { exerciseMeasures } from "../features/exercises/exercisesStorage.js";
import { formatPlannedActivity } from "../features/program/plannedActivity.js";

export function renderExerciseList(exercises, currentIndex = -1, options = {}) {
  if (options.program) {
    return `<ol class="vsg-sport-exercise-list" aria-label="Упражнения тренировки">
      ${exercises.map((exercise) => `<li><strong>${escapeHtml(exercise.name)}</strong><span>${escapeHtml(formatExerciseMeta(exercise))}</span></li>`).join("")}
    </ol>`;
  }
  if (options.workout) {
    return `
      <ol class="vsg-sport-exercise-list" aria-label="Упражнения тренировки">
        ${exercises.map((exercise, index) => {
          const state = options.sessionStarted && index < currentIndex ? "done" : options.sessionStarted && index === currentIndex ? "current" : "next";
          const status = { done: "Пройдено", current: "Сейчас", next: "Далее" }[state];
          return `<li data-state="${state}"><strong>${escapeHtml(exercise.name)}</strong><span>${status} · ${escapeHtml(formatExerciseMeta(exercise))}</span></li>`;
        }).join("")}
      </ol>
    `;
  }
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
  if (exercise.measure === "completion") return "Отметка выполнения";
  if (exercise.measure === "distanceKm" || exercise.measure === "distanceM") {
    return formatPlannedActivity(exercise);
  }
  if (exercise.measure === "weighted") {
    const sets = exercise.sets ? `${exercise.sets} подх.` : "";
    const load = exercise.weight && exercise.target
      ? `${exercise.weight} кг × ${exercise.target} повт.`
      : exercise.weight ? `${exercise.weight} кг` : exercise.target ? `${exercise.target} повт.` : "";
    return [sets, load].filter(Boolean).join(" · ");
  }
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
