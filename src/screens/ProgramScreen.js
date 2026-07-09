import { renderCalendar } from "../components/Calendar.js";
import { renderExerciseList } from "../components/ExerciseList.js";
import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { getWorkouts } from "../features/program/programStorage.js";
import { getActiveWorkoutEditorId, isProgramEditMode } from "../features/program/programEditorState.js";

export function renderProgramScreen() {
  const workouts = getWorkouts();
  const editMode = isProgramEditMode();
  const activeWorkoutId = getActiveWorkoutEditorId();
  const exerciseCatalog = getExerciseCatalog();

  return `
    <section class="stack">
      <div class="section-head">
        <h1>Программа</h1>
        <div class="section-actions">
          <button class="round-add" data-action="addWorkout" aria-label="Добавить тренировку">+</button>
          <button class="round-tool ${editMode ? "active" : ""}" data-action="toggleProgramEdit" aria-label="Изменить тренировки">⚙</button>
        </div>
      </div>
      ${workouts.map((workout, index) => `
        <details class="workout-editor" ${isWorkoutOpen(workout.id, editMode, activeWorkoutId) ? "open" : ""}>
          <summary>${escapeHtml(formatWorkoutTitle(workout, index))}<span>${workout.exercises.length} упр.</span></summary>
          ${editMode ? renderWorkoutControls(workout, index, workouts.length) : ""}
          ${editMode ? renderExerciseEditor(workout, exerciseCatalog) : renderExerciseList(workout.exercises)}
        </details>
      `).join("")}
      <h2>Календарь</h2>
      ${renderCalendar(workouts)}
    </section>
  `;
}

function isWorkoutOpen(workoutId, editMode, activeWorkoutId) {
  if (editMode && activeWorkoutId) return workoutId === activeWorkoutId;
  return false;
}

function renderWorkoutControls(workout, index, total) {
  return `
    <div class="workout-controls">
      <button data-action="renameWorkout" data-workout-id="${workout.id}">Имя</button>
      <button data-action="moveWorkoutUp" data-workout-id="${workout.id}" ${index === 0 ? "disabled" : ""}>↑</button>
      <button data-action="moveWorkoutDown" data-workout-id="${workout.id}" ${index === total - 1 ? "disabled" : ""}>↓</button>
      <button class="danger" data-action="deleteWorkout" data-workout-id="${workout.id}">Удалить</button>
    </div>
  `;
}

function renderExerciseEditor(workout, exerciseCatalog) {
  return `
    <div class="exercise-editor">
      ${workout.exercises.map((exercise, index) => `
        <div class="exercise-edit-row">
          <label>
            <span>Название</span>
            ${renderExerciseSelect(exercise, exerciseCatalog, workout.id, index)}
          </label>
          <div class="exercise-edit-metrics">
            <label>
              <span>Повторы / цель</span>
              <input value="${escapeAttr(exercise.target)}" data-change="updateExercise" data-workout-id="${workout.id}" data-exercise-index="${index}" data-field="target" />
            </label>
            <label>
              <span>Вес (кг)</span>
              <input value="${escapeAttr(exercise.weight || "")}" placeholder="40 кг" data-change="updateExercise" data-workout-id="${workout.id}" data-exercise-index="${index}" data-field="weight" />
            </label>
            <label>
              <span>Подходы</span>
              <input type="number" min="1" step="1" value="${exercise.sets}" data-change="updateExercise" data-workout-id="${workout.id}" data-exercise-index="${index}" data-field="sets" />
            </label>
          </div>
          <div class="exercise-edit-actions">
            <button data-action="moveExerciseUp" data-workout-id="${workout.id}" data-exercise-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button>
            <button data-action="moveExerciseDown" data-workout-id="${workout.id}" data-exercise-index="${index}" ${index === workout.exercises.length - 1 ? "disabled" : ""}>↓</button>
            <button class="danger" data-action="deleteExercise" data-workout-id="${workout.id}" data-exercise-index="${index}">Удалить</button>
          </div>
        </div>
      `).join("")}
      <button class="secondary-button compact" data-action="addExercise" data-workout-id="${workout.id}">Добавить упражнение</button>
    </div>
  `;
}

function renderExerciseSelect(exercise, exerciseCatalog, workoutId, index) {
  const options = [...exerciseCatalog];
  const hasCurrent = options.some((item) => item.name === exercise.name);

  if (exercise.name && !hasCurrent) {
    options.unshift({ id: "current", name: exercise.name });
  }

  return `
    <select data-change="updateExercise" data-workout-id="${workoutId}" data-exercise-index="${index}" data-field="name">
      ${options.map((item) => `
        <option value="${escapeAttr(item.name)}" ${item.name === exercise.name ? "selected" : ""}>${escapeHtml(item.name)}</option>
      `).join("")}
    </select>
  `;
}

function formatWorkoutTitle(workout, index) {
  return `Т${index + 1}. ${stripWorkoutPrefix(workout.title)}`;
}

function stripWorkoutPrefix(title) {
  return String(title).replace(/^Т\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
