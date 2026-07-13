import { clearPlannedWorkout, setPlannedWorkout } from "../features/program/calendarPlanner.js";
import { getWorkouts } from "../features/program/programStorage.js";

export default async function assignWorkout(button) {
  const workouts = getWorkouts();
  const choice = await showWorkoutChoiceDialog(button.dataset.date, workouts);
  if (!choice) return;

  if (choice === "rest") {
    clearPlannedWorkout(button.dataset.date);
    window.dispatchEvent(new CustomEvent("app:changed"));
    return;
  }

  setPlannedWorkout(button.dataset.date, choice);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function showWorkoutChoiceDialog(date, workouts) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog calendar-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-choice-title">
        <div class="confirm-mark">✓</div>
        <h2 id="calendar-choice-title">Тренировка на дату</h2>
        <p>${formatDate(date)}</p>
        <div class="calendar-choice-list">
          <button class="secondary-button" data-workout-choice="rest">День отдыха</button>
          ${workouts.map((workout) => `
            <button class="secondary-button" data-workout-choice="${escapeAttr(workout.id)}">
              <strong>${escapeHtml(workout.title)}</strong>
              <span>${escapeHtml(workout.shortName || "")}</span>
            </button>
          `).join("")}
        </div>
        <div class="confirm-actions single">
          <button class="secondary-button" data-choice-cancel>Отмена</button>
        </div>
      </section>
    `;

    const close = (value) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-choice-cancel]").addEventListener("click", () => close(null));
    overlay.querySelectorAll("[data-workout-choice]").forEach((item) => {
      item.addEventListener("click", () => close(item.dataset.workoutChoice));
    });

    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-workout-choice]")?.focus();
  });
}

function formatDate(value) {
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
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
