import { dateToIso, getPlannedWorkoutId } from "../features/program/calendarPlanner.js";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function renderCalendar(workouts) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getMondayOffset(new Date(year, month, 1));
  const monthTitle = today.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return `
    <section class="calendar-card">
      <div class="calendar-head">
        <strong>${capitalize(monthTitle)}</strong>
      </div>
      <div class="calendar-weekdays">
        ${weekDays.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">
        ${Array.from({ length: firstDayOffset }, () => `<span class="calendar-empty"></span>`).join("")}
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
    <button data-action="assignWorkout" data-date="${iso}" class="${isToday(date) ? "today" : ""}">
      <span>${day}</span>
      <small>${planned ? planned.shortName : ""}</small>
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
