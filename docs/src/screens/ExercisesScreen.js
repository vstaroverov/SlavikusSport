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
      <b class="category-icon">${getCategoryIcon(categoryId)}</b>
      <small>${category.label}</small>
    </span>
  `;
}

function getCategoryIcon(categoryId) {
  const icons = {
    workout: `<svg viewBox="0 0 24 24"><path d="M5 13h14M7 9v8M17 9v8M3 11v4M21 11v4"/></svg>`,
    crossfit: `<svg viewBox="0 0 24 24"><path d="M7 4h10l-2 7h4l-8 9 2-7H8z"/></svg>`,
    strength: `<svg viewBox="0 0 24 24"><path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/></svg>`,
    base: `<svg viewBox="0 0 24 24"><path d="M4 19h16M7 19V9l5-4 5 4v10M10 19v-6h4v6"/></svg>`
  };

  return icons[categoryId] || icons.base;
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
