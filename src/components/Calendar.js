import { dateToIso, getCalendarMonth, getPlannedWorkoutId } from "../features/program/calendarPlanner.js";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
let selectedDate = null;

export function selectCalendarDate(iso) {
  selectedDate = iso;
}

export function renderCalendar(workouts) {
  const visibleMonth = getCalendarMonth();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getMondayOffset(new Date(year, month, 1));
  const monthTitle = visibleMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return `
    <section class="vsg-card vsg-sport-program-calendar" aria-label="Календарь тренировок">
      <div class="vsg-sport-calendar-head">
        <button class="vsg-button vsg-button--icon" type="button" data-action="changeCalendarMonth" data-direction="-1" aria-label="Предыдущий месяц">‹</button>
        <strong aria-live="polite">${capitalize(monthTitle)}</strong>
        <button class="vsg-button vsg-button--icon" type="button" data-action="changeCalendarMonth" data-direction="1" aria-label="Следующий месяц">›</button>
      </div>
      <div class="vsg-sport-weekdays" aria-hidden="true">
        ${weekDays.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="vsg-sport-days">
        ${Array.from({ length: firstDayOffset }, () => `<span aria-hidden="true"></span>`).join("")}
        ${Array.from({ length: days }, (_, index) => renderDay(index + 1, year, month, workouts)).join("")}
      </div>
    </section>
  `;
}

function renderDay(day, year, month, workouts) {
  const date = new Date(year, month, day);
  const iso = dateToIso(date);
  const planned = workouts.find((item) => item.id === getPlannedWorkoutId(iso, false));

  return `
    <button type="button" data-action="assignWorkout" data-date="${iso}" ${planned ? "data-planned" : ""} ${isToday(date) ? "data-today" : ""} aria-pressed="${selectedDate === iso}" aria-label="${escapeAttr(date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }))}${planned ? `, ${escapeAttr(planned.title)}` : ", день отдыха"}">
      <span>${day}</span>
      <small>${planned ? escapeHtml(planned.shortName || planned.title) : ""}</small>
    </button>
  `;
}

function getMondayOffset(date) {
  return (date.getDay() + 6) % 7;
}

function isToday(date) {
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
