import { clearPlannedWorkout, getPlannedWorkoutId, setPlannedWorkout } from "../features/program/calendarPlanner.js";
import { getWorkouts } from "../features/program/programStorage.js";
import { selectCalendarDate } from "../components/Calendar.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default async function assignWorkout(button) {
  const workouts = getWorkouts();
  selectCalendarDate(button.dataset.date);
  button.parentElement?.querySelectorAll('button[aria-pressed="true"]').forEach((day) => day.setAttribute("aria-pressed", "false"));
  button.setAttribute("aria-pressed", "true");
  const choice = await showWorkoutChoiceDialog(button, workouts);
  if (!choice) return;

  if (choice === "rest") {
    clearPlannedWorkout(button.dataset.date);
    dispatchAppChangedKeepingScroll(button);
    return;
  }

  setPlannedWorkout(button.dataset.date, choice);
  dispatchAppChangedKeepingScroll(button);
}

function showWorkoutChoiceDialog(button, workouts) {
  return new Promise((resolve) => {
    const date = button.dataset.date;
    const plannedId = getPlannedWorkoutId(date, false);
    const plannedWorkout = workouts.find((workout) => workout.id === plannedId);
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-program-day-dialog";
    dialog.setAttribute("aria-labelledby", "calendar-choice-title");
    dialog.setAttribute("aria-describedby", "calendar-choice-date calendar-choice-status");
    dialog.innerHTML = `
      <div class="vsg-sport-program-dialog-head"><span class="vsg-sport-program-dialog-mark" aria-hidden="true">▦</span><div><span class="vsg-eyebrow">Календарь</span><h2 id="calendar-choice-title">Тренировка на дату</h2></div></div>
      <time class="vsg-sport-program-day-date" id="calendar-choice-date" datetime="${escapeAttr(date)}">${escapeHtml(formatDate(date))}</time>
      <p class="vsg-sport-program-day-status" id="calendar-choice-status">Сейчас: ${plannedWorkout ? escapeHtml(plannedWorkout.title) : "день отдыха"}</p>
      <div class="vsg-sport-program-choice-list" role="group" aria-label="Назначить на дату">
        <button class="vsg-sport-program-day-option" type="button" data-workout-choice="rest" aria-pressed="${!plannedWorkout}"><span class="vsg-sport-program-index">–</span><span><strong>День отдыха</strong><small>Без тренировки</small></span>${!plannedWorkout ? "<em>Назначен</em>" : ""}</button>
        ${workouts.map((workout, index) => `
          <button class="vsg-sport-program-day-option" type="button" data-workout-choice="${escapeAttr(workout.id)}" aria-pressed="${plannedId === workout.id}">
            <span class="vsg-sport-program-index">Т${index + 1}</span><span><strong>${escapeHtml(stripWorkoutPrefix(workout.title))}</strong><small>${workout.exercises.length} ${plural(workout.exercises.length, "упражнение", "упражнения", "упражнений")}</small></span>${plannedId === workout.id ? "<em>Назначена</em>" : ""}
          </button>
        `).join("")}
      </div>
      <button class="vsg-button" type="button" data-choice-cancel>Отмена</button>
    `;
    dialog.addEventListener("close", () => {
      const value = dialog.returnValue || null;
      dialog.remove();
      button.focus();
      resolve(value);
    }, { once: true });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelector("[data-choice-cancel]").addEventListener("click", () => dialog.close());
    dialog.querySelectorAll("[data-workout-choice]").forEach((item) => {
      item.addEventListener("click", () => dialog.close(item.dataset.workoutChoice));
    });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-workout-choice]")?.focus();
  });
}

function formatDate(value) {
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function stripWorkoutPrefix(title) {
  return String(title).replace(/^Т\d+\.\s*/i, "");
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
