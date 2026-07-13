import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { formatLogText, getLogResults, getResultSummary } from "../features/log/logExercises.js";

export function renderWorkoutLogCard(entry) {
  const results = getLogResults(entry);
  const text = formatLogText(results) || entry.text || "";

  return `
    <article class="log-card">
      <label class="media-slot">
        ${renderMedia(entry.media)}
        <input type="file" accept="image/*,video/*" data-change="attachMedia" data-log-id="${entry.id}" />
      </label>
      <div class="log-card-head">
        <div>
          <strong>${escapeHtml(entry.title)}</strong>
          <span data-log-date-label="${entry.id}">${escapeHtml(entry.finishedAt)}</span>
          <input class="log-date-input" type="datetime-local" value="${toDateTimeLocalValue(entry.finishedAt)}" data-log-date="${entry.id}" hidden />
        </div>
        <details>
          <summary>...</summary>
          <button data-action="editLog" data-log-id="${entry.id}">Изменить</button>
          <button data-action="shareLog" data-log-id="${entry.id}">Поделиться</button>
          <button class="danger" data-action="deleteLog" data-log-id="${entry.id}">Удалить</button>
        </details>
      </div>
      <p class="muted">Время: ${escapeHtml(entry.duration)}</p>
      <pre data-log-text="${entry.id}">${escapeHtml(text)}</pre>
      <div class="log-exercise-editor" data-log-editor="${entry.id}" hidden>
        ${renderLogExerciseEditor(entry.id, results)}
        <button class="secondary-button compact" data-action="addLogExercise" data-log-id="${entry.id}">Добавить упражнение</button>
      </div>
    </article>
  `;
}

export function renderLogExerciseEditor(logId, results) {
  return `
    <div class="log-exercise-list">
      <div class="log-exercise-row log-exercise-row-head">
        <span>Упражнение</span>
        <span>Вес</span>
        <span>Повторы</span>
        <span>Подходы</span>
        <span></span>
      </div>
      ${results.map((result, index) => renderExerciseEditorRow(logId, result, index)).join("")}
    </div>
  `;
}

function renderExerciseEditorRow(logId, result, index) {
  const summary = getResultSummary(result);
  return `
    <div class="log-exercise-row">
      <select data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="name">
        ${renderExerciseOptions(result.name)}
      </select>
      <input value="${escapeAttr(summary.weight)}" inputmode="decimal" placeholder="61" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="weight" />
      <input value="${escapeAttr(summary.repeats)}" inputmode="text" placeholder="20" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="repeats" />
      <input value="${escapeAttr(summary.sets)}" type="number" min="1" step="1" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="sets" />
      <button class="danger" data-action="deleteLogExercise" data-log-id="${logId}" data-exercise-index="${index}">Удалить</button>
    </div>
  `;
}

function renderExerciseOptions(currentName) {
  const catalog = getExerciseCatalog();
  const hasCurrent = catalog.some((exercise) => exercise.name === currentName);
  const options = hasCurrent ? catalog : [{ id: "current", name: currentName }, ...catalog];

  return options.map((exercise) => `
    <option value="${escapeAttr(exercise.name)}" ${exercise.name === currentName ? "selected" : ""}>${escapeHtml(exercise.name)}</option>
  `).join("");
}

function renderMedia(media) {
  if (!media) return `<span>Фото / видео</span>`;
  if (media.type.startsWith("video/")) {
    return `<video src="${media.data}" controls muted playsinline></video>`;
  }
  return `<img src="${media.data}" alt="Медиа тренировки" />`;
}

function toDateTimeLocalValue(value) {
  const date = parseRuDate(value) || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseRuDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4}),?\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5]));
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
