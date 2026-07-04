import { renderExerciseList } from "../components/ExerciseList.js";
import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { getWorkout } from "../features/program/programStorage.js";
import { createWorkoutSession, isWorkoutComplete } from "../features/workout/workoutRunner.js";
import { getActiveSession, formatSeconds, getElapsedSeconds } from "../features/workout/workoutTimer.js";

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
          <h1>День отдыха</h1>
          <p>На эту дату тренировка не назначена в календаре.</p>
        </div>
      </section>
    `;
  }

  const current = active.results[active.currentExercise];
  const complete = isWorkoutComplete(active);

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
          <span>Сейчас</span>
          <h2>${current.name}</h2>
          <p>${formatCurrentExercise(current)}, подход ${active.currentSet} из ${current.sets}</p>
          <input inputmode="text" placeholder="${formatCurrentExercise(current)}" data-set-value />
          <button class="primary-button" data-action="completeSet">Выполнено</button>
        `}
      </div>

      <button class="secondary-button finish-early-button" data-action="finishWorkout">Завершить досрочно</button>
    </section>
  `;
}

function formatCurrentExercise(exercise) {
  return [exercise.weight, exercise.target].filter(Boolean).join(" · ");
}
