import {
  exerciseCategories,
  exerciseMeasures,
  getExerciseCatalog,
  isExerciseCatalogEditMode
} from "../features/exercises/exercisesStorage.js";

export function renderExercisesScreen() {
  const exercises = getExerciseCatalog();
  const editMode = isExerciseCatalogEditMode();

  return `<section class="vsg vsg-sport-catalog-screen">
    <header class="vsg-sport-catalog-heading"><div><span class="vsg-eyebrow">Справочник</span><h1>Упражнения</h1><p>Выбирай упражнения для программы и лога.</p></div><button class="vsg-button vsg-button--primary" type="button" data-action="addCatalogExercise">+ Добавить</button></header>
    <div class="vsg-sport-catalog-toolbar"><span>${exercises.length} ${pluralExercises(exercises.length)}</span><button class="vsg-button vsg-button--small" type="button" data-action="toggleExerciseCatalogEdit" aria-pressed="${editMode}">${editMode ? "Готово" : "Изменить список"}</button></div>
    ${exercises.length ? `<div class="vsg-sport-catalog-list">${exercises.map((exercise) => `
      <article class="vsg-card vsg-sport-catalog-card">
        <h2>${escapeHtml(exercise.name)}</h2>
        <div class="vsg-sport-catalog-meta">${renderMeasure(exercise.measure)}${renderCategory(exercise.category)}</div>
        ${editMode ? `<div class="vsg-sport-catalog-actions"><button class="vsg-button" type="button" data-action="renameCatalogExercise" data-exercise-id="${escapeAttr(exercise.id)}">Изменить</button><button class="vsg-button vsg-button--danger" type="button" data-action="deleteCatalogExercise" data-exercise-id="${escapeAttr(exercise.id)}">Удалить</button></div>` : ""}
      </article>`).join("")}</div>` : `<div class="vsg-empty"><strong>Упражнений пока нет</strong><p>Добавь первое упражнение, чтобы использовать его в программе.</p><button class="vsg-button vsg-button--primary" type="button" data-action="addCatalogExercise">Добавить упражнение</button></div>`}
  </section>`;
}

function renderCategory(categoryId) {
  const category = exerciseCategories[categoryId] || exerciseCategories.base;
  return `<span class="vsg-badge vsg-sport-catalog-category"><b aria-hidden="true">${escapeHtml(category.mark)}</b>${escapeHtml(category.label)}</span>`;
}

function renderMeasure(measureId) {
  const measure = exerciseMeasures[measureId] || exerciseMeasures.repeats;
  return `<span class="vsg-badge vsg-badge--info">${escapeHtml(measure.planLabel || measure.label)}</span>`;
}

function pluralExercises(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "упражнение";
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "упражнения" : "упражнений";
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
