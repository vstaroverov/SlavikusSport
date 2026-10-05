import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { formatLogText, formatLogTextWithRecords, getLogResults, getResultSummary, isRunMeterInput } from "../features/log/logExercises.js";
import { formatDurationForInput } from "../features/workout/durationInput.js";

export function renderWorkoutLogCard(entry, entries = [], showRecords = false) {
  const results = getLogResults(entry);
  const text = showRecords
    ? formatLogTextWithRecords(entry, entries) || formatLogText(results) || entry.text || ""
    : formatLogText(results) || entry.text || "";
  const id = escapeAttr(entry.id);
  const hasRecord = text.includes("★");

  return `
    <article class="vsg-card vsg-sport-log-card">
      <div class="vsg-sport-log-card-head">
        <div>
          <h2>${escapeHtml(entry.title)}</h2>
          <time data-log-date-label="${id}">${escapeHtml(entry.finishedAt)}</time>
          <input class="vsg-input vsg-sport-log-date-input" type="datetime-local" value="${escapeAttr(toDateTimeLocalValue(entry.finishedAt))}" data-log-date="${id}" hidden />
        </div>
        <details class="vsg-sport-log-menu">
          <summary aria-label="Другие действия с записью">•••</summary>
          <button class="vsg-button vsg-button--danger" type="button" data-action="deleteLog" data-log-id="${id}">Удалить запись</button>
        </details>
      </div>
      <div class="vsg-sport-log-meta"><span class="vsg-badge">Время · ${escapeHtml(entry.duration)}</span><span class="vsg-badge vsg-badge--success" data-log-record="${id}" ${hasRecord ? "" : "hidden"}>★ Личный рекорд</span></div>
      <pre class="vsg-sport-log-results" data-log-text="${id}">${escapeHtml(text)}</pre>
      ${renderRoute(results)}
      ${entry.media ? `<div class="vsg-sport-log-media-frame">${renderMedia(entry.media)}</div>` : ""}
      <label class="vsg-sport-log-media">
        <span aria-hidden="true">▣</span><span>${entry.media ? "Заменить фото или видео" : "Добавить фото или видео"}</span>
        <input type="file" accept="image/*,video/*" data-change="attachMedia" data-log-id="${id}" />
      </label>
      <div class="vsg-sport-log-actions">
        <button class="vsg-button" type="button" data-action="editLog" data-log-id="${id}">Изменить</button>
        <button class="vsg-button" type="button" data-action="shareLog" data-log-id="${id}">Поделиться</button>
      </div>
      <div class="vsg-sport-log-editor" data-log-editor="${id}" hidden>
        ${renderLogExerciseEditor(id, results)}
        <button class="vsg-button" type="button" data-action="addLogExercise" data-log-id="${id}">+ Добавить упражнение</button>
      </div>
    </article>
  `;
}

function renderRoute(results) {
  const recorded = results.flatMap((result) => (result.routes || []).flat())
    .filter((point) => Array.isArray(point) && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])));
  const stride = Math.max(1, Math.ceil(recorded.length / 1000));
  const points = recorded.filter((_, index) => index % stride === 0 || index === recorded.length - 1);
  if (points.length < 2) return "";
  const lats = points.map((point) => Number(point[0]));
  const lons = points.map((point) => Number(point[1]));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latSpan = Math.max(maxLat - minLat, 0.00001);
  const lonSpan = Math.max(maxLon - minLon, 0.00001);
  const path = points.map((point) => {
    const x = 10 + (Number(point[1]) - minLon) / lonSpan * 280;
    const y = 110 - (Number(point[0]) - minLat) / latSpan * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<div class="vsg-sport-route"><strong>GPS-маршрут</strong><svg viewBox="0 0 300 120" role="img" aria-label="Схема записанного GPS-маршрута"><polyline points="${path}" /></svg></div>`;
}

export function renderLogExerciseEditor(logId, results) {
  return `
    <div class="vsg-sport-log-edit-list">
      ${results.map((result, index) => renderExerciseEditorRow(logId, result, index)).join("")}
    </div>
  `;
}

function renderExerciseEditorRow(logId, result, index) {
  const summary = getResultSummary(result);
  const distance = result.measure === "distanceKm" || result.measure === "distanceM";
  const runMeters = isRunMeterInput(result);
  const distanceKm = Number(String(result.done?.[0] || "").replace(",", "."));
  const distanceValue = runMeters && Number.isFinite(distanceKm) && distanceKm > 0
    ? String(Math.round(distanceKm * 1000))
    : result.done?.[0] || "";
  return `
    <div class="vsg-sport-log-edit-row" data-measure="${escapeAttr(result.measure || "repeats")}">
      <label class="vsg-field">Упражнение<select class="vsg-input vsg-select" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="name">${renderExerciseOptions(result.name)}</select></label>
      <div class="vsg-sport-log-edit-fields">
      ${result.measure === "completion" ? `
        <span class="vsg-muted">Без показателя</span>
        <label class="vsg-choice"><input type="checkbox" ${result.done?.some((value) => Number(value) > 0) ? "checked" : ""} data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="completed" /> Выполнена</label>
      ` : distance ? `
        <label class="vsg-field">Дистанция, ${result.measure === "distanceM" || runMeters ? "м" : "км"}<input class="vsg-input" value="${escapeAttr(distanceValue)}" inputmode="decimal" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="distance" /></label>
        <label class="vsg-field vsg-sport-duration-field">Время, чч:мм:сс<input class="vsg-input vsg-sport-duration-input" type="text" value="${escapeAttr(formatDurationForInput(result.times?.[0]))}" inputmode="numeric" maxlength="8" pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]" placeholder="00:37:12" data-duration-input data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="time" /><small>Введи 6 цифр: часы, минуты, секунды.</small></label>
      ` : result.measure === "seconds" ? `
        <label class="vsg-field">Секунды<input class="vsg-input" value="${escapeAttr(summary.repeats)}" type="number" min="0" step="1" inputmode="numeric" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="repeats" /></label>
      ` : `
        ${result.measure === "weighted" || summary.weight ? `<label class="vsg-field">Вес, кг<input class="vsg-input" value="${escapeAttr(summary.weight)}" inputmode="decimal" placeholder="0" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="weight" /></label>` : ""}
        <label class="vsg-field">Повторы<input class="vsg-input" value="${escapeAttr(summary.repeats)}" inputmode="numeric" placeholder="20" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="repeats" /></label>
      `}
      ${result.measure === "completion" || distance ? "" : `<label class="vsg-field">Подходы<input class="vsg-input" value="${escapeAttr(summary.sets)}" type="number" min="1" step="1" data-change="updateLogExercise" data-log-id="${logId}" data-exercise-index="${index}" data-field="sets" /></label>`}
      </div>
      <button class="vsg-button vsg-button--danger" type="button" data-action="deleteLogExercise" data-log-id="${logId}" data-exercise-index="${index}">Удалить упражнение</button>
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
  if (!media) return "";
  if (media.type.startsWith("video/")) {
    return `<video class="vsg-sport-log-media-preview" src="${escapeAttr(media.data)}" controls muted playsinline></video>`;
  }
  return `<img class="vsg-sport-log-media-preview" src="${escapeAttr(media.data)}" alt="Медиа тренировки" />`;
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
