import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";

export default async function addWorkout() {
  const title = await showWorkoutDialog();
  if (!title?.trim()) return;

  const workouts = getWorkouts();
  const exercise = getExerciseCatalog()[0];

  workouts.push({
    id: crypto.randomUUID(),
    title: stripWorkoutPrefix(title.trim()),
    shortName: `Т${workouts.length + 1}`,
    exercises: [{
      name: exercise?.name || "Упражнение",
      target: "10",
      weight: "",
      sets: 3
    }]
  });

  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}

function showWorkoutDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog log-add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-workout-title">
        <div class="confirm-mark">+</div>
        <h2 id="add-workout-title">Новая тренировка</h2>
        <label>
          <span>Название</span>
          <input data-workout-title placeholder="Например: День ног" />
        </label>
        <div class="confirm-actions">
          <button class="secondary-button" data-workout-cancel>Отмена</button>
          <button class="primary-button" data-workout-submit>Добавить</button>
        </div>
      </section>
    `;

    const close = (value) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const submit = () => close(overlay.querySelector("[data-workout-title]").value);

    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
      if (event.key === "Enter") submit();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-workout-cancel]").addEventListener("click", () => close(null));
    overlay.querySelector("[data-workout-submit]").addEventListener("click", submit);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-workout-title]").focus();
  });
}

function stripWorkoutPrefix(title) {
  return title.replace(/^Т\d+\.\s*/i, "");
}
