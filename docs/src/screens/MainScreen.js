import { icon } from "../components/Icon.js";
import { getWorkout } from "../features/program/programStorage.js";
import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";
import { isDistanceMeasure } from "../features/exercises/exercisesStorage.js";
import { formatPlannedActivity } from "../features/program/plannedActivity.js";

const quickItems = [
  ["workout", "play", "Старт", "таймер и подходы"],
  ["program", "calendar", "План", "тренировки и календарь"],
  ["log", "note", "Лог", "история занятий"],
  ["stats", "stats", "Стата", "прогресс и советы"],
  ["exercises", "dumbbell", "Упражнения", "список движений из программы", "wide"]
];

export function renderMainScreen() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));
  const exerciseCount = workout?.exercises?.length || 0;
  const setCount = workout?.exercises?.reduce((sum, exercise) => sum + Number(exercise.sets || 0), 0) || 0;
  const onlyActivity = workout?.exercises?.length === 1 && isDistanceMeasure(workout.exercises[0].measure)
    ? workout.exercises[0] : null;
  const summary = onlyActivity
    ? formatPlannedActivity(onlyActivity)
    : `${exerciseCount} ${plural(exerciseCount, "упражнение", "упражнения", "упражнений")} · ${setCount} ${plural(setCount, "подход", "подхода", "подходов")}`;
  const today = new Date();

  return `
    <div class="sport-home-content">
      <section class="vsg-card vsg-sport-today-card sport-today-card" aria-labelledby="sport-today-title">
        <time class="vsg-eyebrow vsg-sport-date" datetime="${todayIso()}">${escapeHtml(today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }))}</time>
        <h1 id="sport-today-title">${escapeHtml(workout?.title || "День отдыха")}</h1>
        <p class="vsg-muted">${workout ? escapeHtml(summary) : "Сегодня тренировка не назначена."}</p>
        <button class="vsg-button vsg-button--primary" type="button" data-route="${workout ? "workout" : "program"}">${workout ? "Начать тренировку" : "Открыть программу"}</button>
      </section>

      <nav class="vsg-sport-quick-grid sport-home-quick" aria-label="Быстрые разделы">
        ${quickItems.map(([route, iconName, title, caption]) => `
          <button type="button" data-route="${route}">
            <span><strong>${title}</strong><small>${caption}</small></span>
            <span aria-hidden="true">${icon(iconName)}</span>
          </button>
        `).join("")}
      </nav>
      <section class="vsg-sport-coach" aria-labelledby="sport-coach-title">
        <h2 id="sport-coach-title">Тренер</h2>
        <div class="vsg-sport-coach-grid">
          <button type="button" data-action="inviteFriend"><strong>Пригласить друга</strong><small>QR-код и ссылка</small></button>
          <button type="button" data-action="shareTraining"><strong>Поделиться тренировкой</strong><small>Отправить или загрузить файл</small></button>
        </div>
      </section>
    </div>
  `;
}

function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
