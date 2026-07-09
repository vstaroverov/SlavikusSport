import {
  exerciseCategories,
  getExerciseCatalog,
  isExerciseCatalogEditMode
} from "../features/exercises/exercisesStorage.js";

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
              <div class="exercise-catalog-head">
                <strong>${escapeHtml(exercise.name)}</strong>
                ${renderCategory(exercise.category)}
              </div>
              ${editMode ? `
                <div class="exercise-catalog-actions">
                  <button data-action="renameCatalogExercise" data-exercise-id="${exercise.id}" data-exercise-name="${escapeAttr(exercise.name)}" data-exercise-category="${exercise.category || "base"}">Изменить</button>
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

function renderCategory(categoryId) {
  const category = exerciseCategories[categoryId] || exerciseCategories.base;

  return `
    <span class="exercise-category-badge category-${categoryId || "base"}">
      <b>${category.mark}</b>
      <small>${category.label}</small>
    </span>
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
