import { getExerciseCatalog, isExerciseCatalogEditMode } from "../features/exercises/exercisesStorage.js";

export function renderExercisesScreen() {
  const exercises = getExerciseCatalog();
  const editMode = isExerciseCatalogEditMode();

  return `
    <section class="stack">
      <div class="section-head">
        <h1>Упражнения</h1>
        <div class="section-actions">
          <button class="round-add" data-action="addCatalogExercise" aria-label="Добавить упражнение">+</button>
          <button class="round-tool ${editMode ? "active" : ""}" data-action="toggleExerciseCatalogEdit" aria-label="Изменить упражнения">⚙</button>
        </div>
      </div>
      ${exercises.length ? `
        <div class="exercise-directory">
          ${exercises.map((exercise) => `
            <article class="plain-panel exercise-directory-card compact-exercise-card">
              <strong>${escapeHtml(exercise.name)}</strong>
              ${editMode ? `
                <div class="exercise-catalog-actions">
                  <button data-action="renameCatalogExercise" data-exercise-id="${exercise.id}" data-exercise-name="${escapeAttr(exercise.name)}">Изменить</button>
                  <button class="danger" data-action="deleteCatalogExercise" data-exercise-id="${exercise.id}">Удалить</button>
                </div>
              ` : ""}
            </article>
          `).join("")}
        </div>
      ` : `
        <div class="empty-state">Добавь первое упражнение через кнопку плюс.</div>
      `}
    </section>
  `;
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
