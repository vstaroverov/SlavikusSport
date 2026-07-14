import { renderExerciseList } from "../components/ExerciseList.js";
import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession, isWorkoutComplete } from "../features/workout/workoutRunner.js";
import { getActiveSession, formatSeconds, getElapsedSeconds, getRestRemainingSeconds } from "../features/workout/workoutTimer.js";
import { getLogEntries } from "../features/log/logStorage.js";
import { getLogResults } from "../features/log/logExercises.js";

export function renderWorkoutScreen() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));
  const session = getActiveSession();
  const active = session || (workout ? { ...createWorkoutSession(workout), running: false } : null);

  if (!active) {
    return `
      <section class="workout-top rest-day">
        <div class="timer">00:00:00</div>
      </section>
      <section class="stack">
        <div class="current-card">
          <span>Сегодня</span>
          <h1>Тренировка не назначена</h1>
          <p>Создай программу или выбери тренировку в календаре.</p>
          <button class="primary-button" data-route="program">Открыть программу</button>
        </div>
      </section>
    `;
  }

  const current = active.results[active.currentExercise];
  const complete = isWorkoutComplete(active);
  const workload = complete ? null : getExerciseWorkloadInfo(current.name);
  const restRemaining = getRestRemainingSeconds(active);

  return `
    <section class="workout-top">
      <button class="start-button ${active.running ? "running" : ""}" data-action="${session ? "toggleWorkout" : "startWorkout"}">
        ${active.running ? "Пауза" : "Старт"}
      </button>
      <div class="timer" data-timer>${formatSeconds(getElapsedSeconds(active))}</div>
    </section>

    <section class="stack workout-stack">
      <h1>${active.title}</h1>
      ${renderExerciseList(active.results, active.currentExercise)}

      <div class="current-card">
        ${complete ? `
          <strong>Все упражнения закрыты</strong>
          <button class="primary-button" data-action="finishWorkout">Сохранить в лог</button>
        ` : `
          <div class="current-card-head">
            <div>
              <span>Сейчас</span>
              <h2>${current.name}</h2>
              <p>${formatCurrentExercise(current)}, подход ${active.currentSet} из ${current.sets}</p>
            </div>
            ${workload ? `
              <div class="current-workload">
                <span>Рабочий</span>
                <strong>${escapeHtml(workload.latest)}</strong>
                <small>(${escapeHtml(workload.best)})</small>
              </div>
            ` : ""}
          </div>
          <input inputmode="text" value="${escapeAttr(workload?.latest || "")}" placeholder="${formatCurrentExercise(current)}" data-set-value />
          <div class="set-quick-actions">
            <button class="secondary-button" data-action="adjustSetValue" data-mode="repeats" data-step="1">+1 повтор</button>
            <button class="secondary-button" data-action="adjustSetValue" data-mode="weight" data-step="2.5">+2.5 кг</button>
            <button class="secondary-button" data-action="adjustSetValue" data-mode="weight" data-step="-2.5">-2.5 кг</button>
          </div>
          ${restRemaining ? `
            <div class="rest-timer">
              <span>Отдых</span>
              <strong data-rest-timer>${formatSeconds(restRemaining)}</strong>
            </div>
          ` : ""}
          <button class="primary-button" data-action="completeSet">Выполнено</button>
        `}
      </div>

      <button class="secondary-button finish-early-button" data-action="finishWorkout">Завершить досрочно</button>
    </section>
  `;
}

function formatCurrentExercise(exercise) {
  const weight = normalizeWeight(exercise.weight);
  const repeats = String(exercise.target || "").trim();
  if (weight && repeats) return `${weight}х${repeats}`;
  return repeats || String(exercise.weight || "").trim();
}

function normalizeWeight(value) {
  const text = String(value || "");
  if (/\d+\s*(с|сек|секунд|мин|минут|ч|час)/i.test(text)) return "";
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  const normalized = Number(number.replace(",", "."));
  return normalized > 0 ? String(normalized) : "";
}

function getExerciseWorkloadInfo(name) {
  const approaches = getLogEntries()
    .map((entry, entryIndex) => ({
      entry,
      entryIndex,
      timestamp: parseRuDate(entry.finishedAt)?.getTime() || 0
    }))
    .flatMap(({ entry, entryIndex, timestamp }) => (
      getLogResults(entry).flatMap((result, resultIndex) => (
        normalizeName(result.name) === normalizeName(name)
          ? getResultApproaches(result).map((approach, approachIndex) => ({
            ...approach,
            entryIndex,
            resultIndex,
            approachIndex,
            timestamp
          }))
          : []
      ))
    ));

  if (!approaches.length) return null;

  const latest = approaches.slice().sort((a, b) => (
    b.timestamp - a.timestamp
    || a.entryIndex - b.entryIndex
    || b.resultIndex - a.resultIndex
    || b.approachIndex - a.approachIndex
  ))[0];

  const best = approaches.slice().sort((a, b) => (
    b.weight - a.weight
    || b.repeats - a.repeats
    || b.timestamp - a.timestamp
  ))[0];

  return {
    latest: formatApproach(latest),
    best: formatApproach(best)
  };
}

function getResultApproaches(result) {
  const done = Array.isArray(result.done) ? result.done : [];
  const weights = Array.isArray(result.weights) ? result.weights : [];
  const fallbackWeight = parseNumber(result.weight);

  return done.map((value, index) => ({
    repeats: parseNumber(value),
    rawRepeats: String(value || "").trim(),
    weight: parseNumber(weights[index]) || fallbackWeight,
    rawWeight: String(weights[index] || result.weight || "").trim()
  })).filter((approach) => approach.repeats > 0 || approach.rawRepeats);
}

function formatApproach(approach) {
  if (approach.weight > 0) return `${formatNumber(approach.weight)}х${approach.rawRepeats || formatNumber(approach.repeats)}`;
  return approach.rawRepeats || formatNumber(approach.repeats);
}

function parseNumber(value) {
  const number = String(value || "").match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  return Number(number.replace(",", ".")) || 0;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function normalizeName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
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
