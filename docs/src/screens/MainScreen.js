import { icon } from "../components/Icon.js";
import { getWorkout } from "../features/program/programStorage.js";
import { getPlannedWorkoutId, todayIso } from "../features/program/calendarPlanner.js";

const quickItems = [
  ["workout", "play", "Старт", "таймер и подходы"],
  ["program", "calendar", "План", "тренировки и календарь"],
  ["log", "note", "Лог", "история занятий"],
  ["stats", "stats", "Стата", "прогресс и советы"],
  ["exercises", "dumbbell", "Упражнения", "список движений из программы", "wide"]
];

export function renderMainScreen() {
  const workout = getWorkout(getPlannedWorkoutId(todayIso(), false));

  return `
    <section class="today-panel">
      <div class="today-copy">
        <span>${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span>
        <h1>${workout?.title || "День отдыха"}</h1>
      </div>
      <button class="primary-button" data-route="workout">${workout ? "Начать тренировку" : "Открыть тренировку"}</button>
    </section>

    <section class="quick-grid">
      ${quickItems.map(([route, iconName, title, caption, variant]) => `
        <button class="${variant === "wide" ? "wide" : ""}" data-route="${route}">
          <strong>${title}</strong>
          <span class="quick-caption">${caption}</span>
          <span class="quick-icon">${icon(iconName)}</span>
        </button>
      `).join("")}
    </section>
  `;
}
