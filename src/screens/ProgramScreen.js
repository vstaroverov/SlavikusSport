import { renderCalendar } from "../components/Calendar.js";
import { renderExerciseList } from "../components/ExerciseList.js";
import { getExerciseCatalog, isDistanceMeasure } from "../features/exercises/exercisesStorage.js";
import { getWorkouts } from "../features/program/programStorage.js";
import { getActiveWorkoutEditorId, isProgramEditMode } from "../features/program/programEditorState.js";
import { formatDurationForInput } from "../features/workout/durationInput.js";

export function renderProgramScreen() {
  const workouts = getWorkouts();
  const editMode = isProgramEditMode();
  const activeWorkoutId = getActiveWorkoutEditorId();
  const exerciseCatalog = getExerciseCatalog();

  return `
    <section class="vsg vsg-sport-program-screen">
      <div class="vsg-sport-program-heading">
        <div><span class="vsg-eyebrow">План занятий</span><h1>Программа</h1><p class="vsg-muted">${workouts.length} ${plural(workouts.length, "тренировка", "тренировки", "тренировок")} · календарь занятий</p></div>
        <button class="vsg-button vsg-button--primary" type="button" data-action="addWorkout">+ Тренировка</button>
      </div>
      <div class="vsg-sport-program-toolbar">
        <button class="vsg-button" type="button" data-action="addWorkoutTemplate">Шаблоны</button>
        <button class="vsg-button" type="button" data-action="toggleProgramEdit" aria-pressed="${editMode}">${editMode ? "Готово" : "Изменить"}</button>
      </div>
      ${editMode ? `<div class="vsg-sport-program-hint"><strong>Режим редактирования</strong><span>Выбери тренировку, чтобы изменить состав и порядок упражнений.</span></div>` : ""}
      ${workouts.length ? workouts.map((workout, index) => `
        <details class="vsg-sport-program-card" data-program-workout-id="${escapeAttr(workout.id)}" ${isWorkoutOpen(workout.id, editMode, activeWorkoutId) ? "open" : ""}>
          <summary>
            <span class="vsg-sport-program-index">Т${index + 1}</span>
            <span class="vsg-sport-program-summary"><strong>${escapeHtml(stripWorkoutPrefix(workout.title))}</strong><small>${workout.exercises.length} ${plural(workout.exercises.length, "упражнение", "упражнения", "упражнений")}</small></span>
            <span aria-hidden="true">⌄</span>
          </summary>
          <div class="vsg-sport-program-body">
            ${editMode ? renderWorkoutControls(workout, index, workouts.length) : ""}
            ${editMode ? renderExerciseEditor(workout, exerciseCatalog) : renderExerciseList(workout.exercises, -1, { program: true })}
          </div>
        </details>
      `).join("") : `
        <div class="vsg-card vsg-sport-program-empty">
          <h2>Тренировок пока нет</h2>
          <p class="vsg-muted">Создай тренировку или выбери готовый шаблон.</p>
          <button class="vsg-button vsg-button--primary" type="button" data-action="addWorkout">Создать тренировку</button>
        </div>
      `}
      <div class="vsg-sport-program-calendar-title"><span class="vsg-eyebrow">Расписание</span><h2>Календарь</h2><p class="vsg-muted">Нажми на день, чтобы назначить тренировку.</p></div>
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
    <div class="vsg-sport-program-controls">
      <div class="vsg-sport-program-controls-title"><strong>Редактирование тренировки</strong><small>Название и порядок</small></div>
      <div class="vsg-sport-program-control-actions">
        <button class="vsg-button" type="button" data-action="renameWorkout" data-workout-id="${workout.id}">Название</button>
        <button class="vsg-button" type="button" data-action="moveWorkoutUp" data-workout-id="${workout.id}" aria-label="Переместить тренировку выше" ${index === 0 ? "disabled" : ""}>↑</button>
        <button class="vsg-button" type="button" data-action="moveWorkoutDown" data-workout-id="${workout.id}" aria-label="Переместить тренировку ниже" ${index === total - 1 ? "disabled" : ""}>↓</button>
        <button class="vsg-button" type="button" data-action="copyWorkout" data-workout-id="${workout.id}">Копия</button>
      </div>
      <button class="vsg-button vsg-button--danger" type="button" data-action="deleteWorkout" data-workout-id="${workout.id}">Удалить тренировку</button>
    </div>
  `;
}

function renderExerciseEditor(workout, exerciseCatalog) {
  return `
    <div class="vsg-sport-program-editor" data-workout-editor="${workout.id}">
      <div class="vsg-sport-program-editor-title">
        <strong>Упражнения</strong>
        <span>${workout.exercises.length} в тренировке</span>
      </div>
      ${workout.exercises.map((exercise, index) => `
        <div class="vsg-sport-program-exercise">
          <button class="vsg-sport-program-index vsg-sport-program-position" type="button" data-action="moveExerciseToPosition" data-workout-id="${workout.id}" data-exercise-index="${index}" data-exercise-total="${workout.exercises.length}" aria-label="Переставить упражнение ${index + 1}">${index + 1}</button>
          <label class="vsg-field">
            <span>Упражнение</span>
            ${renderExerciseSelect(exercise, exerciseCatalog, workout.id, index)}
          </label>
          <div class="vsg-sport-program-fields ${!isDistanceMeasure(exercise.measure) && exercise.measure === "weighted" ? "vsg-sport-program-fields--three" : ""}">
            ${renderExerciseParams(exercise, workout.id, index)}
          </div>
          <div class="vsg-sport-program-row-actions">
            <button class="vsg-button" type="button" data-action="moveExerciseUp" data-workout-id="${workout.id}" data-exercise-index="${index}" aria-label="Упражнение выше" ${index === 0 ? "disabled" : ""}>↑</button>
            <button class="vsg-button" type="button" data-action="moveExerciseDown" data-workout-id="${workout.id}" data-exercise-index="${index}" aria-label="Упражнение ниже" ${index === workout.exercises.length - 1 ? "disabled" : ""}>↓</button>
            <button class="vsg-button vsg-button--danger" type="button" data-action="deleteExercise" data-workout-id="${workout.id}" data-exercise-index="${index}" aria-label="Удалить упражнение">×</button>
          </div>
        </div>
      `).join("")}
      <div class="vsg-sport-program-footer"><button class="vsg-button" type="button" data-action="addExercise" data-workout-id="${workout.id}">Добавить упражнение</button>
      <button class="vsg-button vsg-button--primary" type="button" data-action="saveWorkoutEditor" data-workout-id="${workout.id}">Сохранить</button></div>
    </div>
  `;
}

function renderExerciseParams(exercise, workoutId, index) {
  const attributes = `data-change="updateExercise" data-workout-id="${workoutId}" data-exercise-index="${index}"`;
  if (exercise.measure === "completion") return `<p class="vsg-muted vsg-sport-program-fact">Без показателя · отметка выполнения</p>`;
  if (isDistanceMeasure(exercise.measure)) {
    const unit = exercise.measure === "distanceKm" ? "км" : "м";
    return `
      <label class="vsg-field"><span>Расстояние, ${unit}</span><input class="vsg-input" type="number" min="0" step="any" inputmode="decimal" value="${escapeAttr(exercise.target || "")}" ${attributes} data-field="target" /></label>
      <label class="vsg-field vsg-sport-duration-field"><span>Плановое время, чч:мм:сс</span><input class="vsg-input vsg-sport-duration-input" type="text" inputmode="numeric" maxlength="8" pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]" placeholder="00:37:12" value="${escapeAttr(formatDurationForInput(exercise.time))}" data-duration-input ${attributes} data-field="time" /><small>Введи 6 цифр: часы, минуты, секунды.</small></label>
    `;
  }
  if (exercise.measure === "seconds") {
    return `
      <label class="vsg-field"><span>Цель, секунды</span><input class="vsg-input" type="number" min="0" step="1" inputmode="numeric" value="${escapeAttr(exercise.target || "")}" ${attributes} data-field="target" /></label>
      <label class="vsg-field"><span>Подходы</span><input class="vsg-input" type="number" min="1" step="1" value="${exercise.sets}" ${attributes} data-field="sets" /></label>
    `;
  }
  return `
    <label class="vsg-field"><span>Повторы</span><input class="vsg-input" value="${escapeAttr(exercise.target || "")}" ${attributes} data-field="target" /></label>
    ${exercise.measure === "weighted" ? `<label class="vsg-field"><span>Вес, кг</span><input class="vsg-input" inputmode="decimal" value="${escapeAttr(exercise.weight || "")}" placeholder="0" ${attributes} data-field="weight" /></label>` : ""}
    <label class="vsg-field"><span>Подходы</span><input class="vsg-input" type="number" min="1" step="1" value="${exercise.sets}" ${attributes} data-field="sets" /></label>
  `;
}

function renderExerciseSelect(exercise, exerciseCatalog, workoutId, index) {
  const options = [...exerciseCatalog];
  const hasCurrent = options.some((item) => item.name === exercise.name);

  if (exercise.name && !hasCurrent) {
    options.unshift({ id: "current", name: exercise.name });
  }

  return `
    <select class="vsg-input" data-change="updateExercise" data-workout-id="${workoutId}" data-exercise-index="${index}" data-field="name">
      ${options.map((item) => `
        <option value="${escapeAttr(item.name)}" ${item.name === exercise.name ? "selected" : ""}>${escapeHtml(item.name)}</option>
      `).join("")}
    </select>
  `;
}

function stripWorkoutPrefix(title) {
  return String(title).replace(/^Т\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}

function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
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
