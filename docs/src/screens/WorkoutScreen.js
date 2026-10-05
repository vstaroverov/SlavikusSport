import { renderExerciseList } from "../components/ExerciseList.js";
import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession, isWorkoutComplete } from "../features/workout/workoutRunner.js";
import { getActiveSession, formatSeconds, getElapsedSeconds, getRestRemainingSeconds } from "../features/workout/workoutTimer.js";
import { getLogEntries } from "../features/log/logStorage.js";
import { getLogResults } from "../features/log/logExercises.js";
import { isRunExercise } from "../features/workout/automaticRunTracking.js";
import { formatDurationForInput } from "../features/workout/durationInput.js";
import { formatPlannedTime } from "../features/program/plannedActivity.js";

export function renderWorkoutScreen() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));
  const session = getActiveSession();
  const visibleSession = isSessionForWorkout(session, workout) ? session : null;
  const active = visibleSession || (workout ? { ...createWorkoutSession(workout), running: false } : null);

  if (!active) {
    return `
      <div class="vsg vsg-sport-workout-screen">
        <section class="vsg-card vsg-sport-workout-hero" aria-labelledby="workout-title">
          <span class="vsg-badge">День отдыха</span>
          <h1 id="workout-title">Тренировка не назначена</h1>
          <p class="vsg-muted">Создай программу или выбери тренировку в календаре.</p>
          <output class="vsg-sport-timer" aria-label="Время тренировки">00:00:00</output>
          <button class="vsg-button vsg-button--primary" type="button" data-route="program">Открыть программу</button>
        </section>
      </div>
    `;
  }

  const complete = isWorkoutComplete(active);
  const current = complete ? null : active.results[active.currentExercise];
  const isDistance = current?.measure === "distanceKm" || current?.measure === "distanceM";
  const isCompletion = current?.measure === "completion";
  const workload = current && !isDistance && !isCompletion ? getExerciseWorkloadInfo(current.name, current.measure) : null;
  const restRemaining = getRestRemainingSeconds(active);
  const state = complete ? "complete" : !visibleSession ? "waiting" : active.running ? "running" : "paused";
  const status = { complete: "Готово", waiting: "Ожидание", running: "Идёт тренировка", paused: "Пауза" }[state];
  const startButtonText = complete ? "Сохранить в лог" : !visibleSession ? "Начать тренировку" : (active.running ? "Пауза" : "Продолжить");

  return `
    <div class="vsg vsg-sport-workout-screen">
      <section class="vsg-card vsg-sport-workout-hero" aria-labelledby="workout-title">
        <div class="vsg-sport-between"><span class="vsg-badge vsg-sport-session-status" data-state="${state}">${status}</span><span class="vsg-muted">Сегодня</span></div>
        <h1 id="workout-title">${escapeHtml(active.title)}</h1>
        <output class="vsg-sport-timer" aria-label="Время тренировки" ${visibleSession ? "data-timer" : ""}>${formatSeconds(getElapsedSeconds(active))}</output>
        <button class="vsg-button vsg-button--primary" type="button" data-action="${complete ? "finishWorkout" : visibleSession ? "toggleWorkout" : "startWorkout"}">${startButtonText}</button>
      </section>

      ${visibleSession ? `
      <section class="vsg-card current-card vsg-sport-current-card" aria-labelledby="current-exercise-title">
        ${complete ? `
          <h2 id="current-exercise-title">Все упражнения закрыты</h2>
          <p class="vsg-muted">Сохрани результат, чтобы увидеть его в логе.</p>
        ` : `
          <div class="vsg-sport-between">
            <span class="vsg-eyebrow">${active.running ? "Сейчас" : "На паузе"}</span>
            <span class="vsg-badge">${isDistance ? "Дистанция" : isCompletion ? "Факт выполнения" : `Подход ${active.currentSet} из ${current.sets}`}</span>
          </div>
          <h2 id="current-exercise-title">${escapeHtml(current.name)}</h2>
          <p class="vsg-muted">${isDistance ? `${current.target ? `План: ${escapeHtml(current.target)} ${current.measure === "distanceKm" ? "км" : "м"}` : "Запиши дистанцию и время"}${current.time ? ` · ${escapeHtml(formatPlannedTime(current.time))}` : ""}` : isCompletion ? "Отметь, когда закончишь разминку." : `План: ${escapeHtml(formatCurrentExercise(current)) || "укажи результат"}`}</p>
          ${workload ? `<div class="vsg-sport-workload"><span>Крайний ${escapeHtml(workload.latest)}</span><span>Лучший ${escapeHtml(workload.best)}</span></div>` : ""}
          ${isRunExercise(current) && window.Capacitor?.getPlatform?.() === "android" ? `
            <div class="vsg-sport-gps" data-run-tracker>
              <strong>GPS-маршрут</strong>
              <span data-run-tracker-status>${active.running ? "GPS запускается" : "GPS на паузе"}</span>
            </div>
          ` : ""}
          ${active.running ? `
          ${isCompletion ? "" : isDistance ? `
            <div class="vsg-sport-fields">
              <label class="vsg-field">Дистанция, ${current.measure === "distanceKm" ? "км" : "м"}
                <input class="vsg-input" type="number" min="0" step="any" inputmode="decimal" placeholder="${escapeAttr(current.target || "0")}" data-distance-value />
              </label>
              <label class="vsg-field vsg-sport-duration-field">Время, чч:мм:сс
                <input class="vsg-input vsg-sport-duration-input" type="text" inputmode="numeric" maxlength="8" pattern="[0-9]{2}:[0-5][0-9]:[0-5][0-9]" placeholder="${escapeAttr(formatDurationForInput(current.time) || "00:25:00")}" data-duration-input data-duration-value />
                <small>Введи 6 цифр: часы, минуты, секунды.</small>
              </label>
            </div>
          ` : `
            <label class="vsg-field">${current.measure === "seconds" ? "Результат, секунды" : "Результат подхода"}
              <input class="vsg-input" ${current.measure === "seconds" ? 'type="number" min="0" step="1" inputmode="numeric"' : 'inputmode="text"'} value="${escapeAttr(current.measure === "seconds" ? (parseNumber(workload?.latest) || "") : (workload?.latest || ""))}" placeholder="${escapeAttr(current.measure === "seconds" ? parseNumber(current.target) || "" : formatCurrentExercise(current))}" data-set-value />
            </label>
            ${renderSetQuickActions(current)}
          `}
          ${restRemaining ? `
            <div class="vsg-sport-rest">
              <span>Отдых</span>
              <strong data-rest-timer>${formatSeconds(restRemaining)}</strong>
            </div>
          ` : ""}
          ${!isDistance && !isCompletion ? `<progress max="${Math.max(1, Number(current.sets) || 1)}" value="${Math.max(0, active.currentSet - 1)}" aria-label="Пройдено подходов"></progress>` : ""}
          <div class="vsg-sport-actions">
            <button class="vsg-button vsg-button--primary" type="button" data-action="completeSet">${isCompletion ? "Выполнена" : "Выполнено"}</button>
            <button class="vsg-button" type="button" data-action="skipSet">Пропустить</button>
          </div>
          ` : `<p class="vsg-muted">Продолжи тренировку, чтобы записать результат.</p>`}
        `}
      </section>
      ` : ""}

      <section class="vsg-card vsg-sport-workout-plan" aria-labelledby="workout-plan-title">
        <h2 id="workout-plan-title">Упражнения</h2>
        ${renderExerciseList(active.results, active.currentExercise, { workout: true, sessionStarted: Boolean(visibleSession) })}
      </section>

      ${visibleSession ? `
      ${!complete ? `<button class="vsg-button vsg-sport-workout-finish" type="button" data-action="finishWorkout">Завершить досрочно</button>` : ""}
      ` : ""}
    </div>
  `;
}

function isSessionForWorkout(session, workout) {
  if (!session || !workout) return false;
  if (session.workoutId !== workout.id) return false;

  const sessionExercises = Array.isArray(session.results) ? session.results : [];
  const workoutExercises = Array.isArray(workout.exercises) ? workout.exercises : [];

  if (sessionExercises.length !== workoutExercises.length) return false;

  return sessionExercises.every((exercise, index) => (
    exercise.name === workoutExercises[index]?.name
    && String(exercise.target || "") === String(workoutExercises[index]?.target || "")
    && String(exercise.time || "") === String(workoutExercises[index]?.time || "")
    && String(exercise.weight || "") === String(workoutExercises[index]?.weight || "")
    && Number(exercise.sets || 0) === Number(workoutExercises[index]?.sets || 0)
  ));
}

function formatCurrentExercise(exercise) {
  if (exercise.measure === "seconds") return parseNumber(exercise.target) > 0 ? `${parseNumber(exercise.target)} с` : "";
  const weight = normalizeWeight(exercise.weight);
  const repeats = String(exercise.target || "").trim();
  if (weight && repeats) return `${weight}х${repeats}`;
  return repeats || String(exercise.weight || "").trim();
}

function renderSetQuickActions(exercise) {
  if (exercise.measure === "weighted") {
    return `
      <div class="vsg-sport-set-quick">
        <button class="vsg-button vsg-button--small" type="button" data-action="adjustSetValue" data-mode="repeats" data-step="1">+1 повтор</button>
        <button class="vsg-button vsg-button--small" type="button" data-action="adjustSetValue" data-mode="weight" data-step="2.5">+2.5 кг</button>
        <button class="vsg-button vsg-button--small" type="button" data-action="adjustSetValue" data-mode="weight" data-step="-2.5">−2.5 кг</button>
      </div>
    `;
  }

  if (exercise.measure === "seconds") {
    return `<div class="vsg-sport-set-quick"><button class="vsg-button vsg-button--small" type="button" data-action="adjustSetValue" data-mode="repeats" data-step="1">+1 с</button></div>`;
  }

  return `
    <div class="vsg-sport-set-quick">
      <button class="vsg-button vsg-button--small" type="button" data-action="adjustSetValue" data-mode="repeats" data-step="1">+1</button>
    </div>
  `;
}

function normalizeWeight(value) {
  const text = String(value || "");
  if (/\d+\s*(с|сек|секунд|мин|минут|ч|час)/i.test(text)) return "";
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  const normalized = Number(number.replace(",", "."));
  return normalized > 0 ? String(normalized) : "";
}

function getExerciseWorkloadInfo(name, measure) {
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

  const completedApproaches = approaches.filter((approach) => approach.repeats > 0);
  if (!completedApproaches.length) return null;

  const latest = completedApproaches.slice().sort((a, b) => (
    b.timestamp - a.timestamp
    || a.entryIndex - b.entryIndex
    || b.resultIndex - a.resultIndex
    || b.approachIndex - a.approachIndex
  ))[0];

  const best = completedApproaches.slice().sort((a, b) => (
    (measure === "seconds" ? 0 : b.weight - a.weight)
    || b.repeats - a.repeats
    || b.timestamp - a.timestamp
  ))[0];

  return {
    latest: formatApproach(latest, measure),
    best: formatApproach(best, measure)
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
  })).filter((approach) => approach.repeats > 0);
}

function formatApproach(approach, measure) {
  if (measure === "seconds") return `${formatNumber(approach.repeats)} с`;
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
