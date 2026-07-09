import { getWorkouts } from "../features/program/programStorage.js";

export function renderExercisesScreen() {
  const exercises = collectExercises();

  return `
    <section class="stack">
      <h1>Упражнения</h1>
      ${exercises.length ? `
        <div class="exercise-directory">
          ${exercises.map((exercise) => `
            <article class="plain-panel exercise-directory-card">
              <div>
                <strong>${escapeHtml(exercise.name)}</strong>
                <span>${escapeHtml(exercise.workouts.join(", "))}</span>
              </div>
              <p>
                <span>Повторы: ${escapeHtml(exercise.target || "+")}</span>
                <span>Подходы: ${exercise.sets || 1}</span>
                <span>Вес: ${escapeHtml(exercise.weight || "0")} кг</span>
              </p>
            </article>
          `).join("")}
        </div>
      ` : `
        <div class="empty-state">Добавь упражнения в программе, и они появятся здесь.</div>
      `}
    </section>
  `;
}

function collectExercises() {
  const map = new Map();

  getWorkouts().forEach((workout, workoutIndex) => {
    const workoutTitle = formatWorkoutTitle(workout, workoutIndex);

    workout.exercises.forEach((exercise) => {
      const name = String(exercise.name || "Упражнение").trim();
      const key = name.toLowerCase();
      const current = map.get(key);

      if (current) {
        if (!current.workouts.includes(workoutTitle)) current.workouts.push(workoutTitle);
        return;
      }

      map.set(key, {
        name,
        target: exercise.target || "+",
        sets: exercise.sets || 1,
        weight: exercise.weight || "",
        workouts: [workoutTitle]
      });
    });
  });

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function formatWorkoutTitle(workout, index) {
  return `Т${index + 1}. ${stripWorkoutPrefix(workout.title)}`;
}

function stripWorkoutPrefix(title) {
  return String(title).replace(/^Т\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
