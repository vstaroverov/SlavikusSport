import {
  exerciseCategories,
  exerciseMeasures,
  getExerciseCatalog
} from "../features/exercises/exercisesStorage.js";

let nextDialogId = 0;

export function showExerciseCatalogDialog({ exercise = null, returnFocus } = {}) {
  return new Promise((resolve) => {
    const id = ++nextDialogId;
    const editing = Boolean(exercise);
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-catalog-dialog";
    dialog.setAttribute("aria-labelledby", `catalog-dialog-title-${id}`);
    dialog.setAttribute("aria-describedby", `catalog-dialog-copy-${id}`);
    dialog.innerHTML = `<form class="vsg-sport-catalog-form" data-catalog-form>
      <div class="vsg-sport-catalog-dialog-head"><span class="vsg-sport-catalog-dialog-mark" aria-hidden="true">${editing ? "✎" : "+"}</span><div><span class="vsg-eyebrow">Справочник</span><h2 id="catalog-dialog-title-${id}">${editing ? "Редактировать упражнение" : "Новое упражнение"}</h2></div></div>
      <p class="vsg-sport-catalog-dialog-copy" id="catalog-dialog-copy-${id}">${editing ? "Измени название, категорию или единицу измерения." : "Добавь упражнение для программы и лога."}</p>
      ${editing ? `<div class="vsg-sport-catalog-dialog-preview"><strong>${escapeHtml(exercise.name)}</strong><small>${escapeHtml(exerciseMeasures[exercise.measure]?.label || exerciseMeasures.repeats.label)} · ${escapeHtml(exerciseCategories[exercise.category]?.label || exerciseCategories.base.label)}</small></div>` : ""}
      <div class="vsg-sport-catalog-fields">
        <label class="vsg-field">Название<input class="vsg-input" data-catalog-name value="${escapeAttr(exercise?.name || "")}" placeholder="Например: Планка" autocomplete="off" maxlength="80" required></label>
        <label class="vsg-field">Категория<select class="vsg-input vsg-select" data-catalog-category>${Object.entries(exerciseCategories).map(([key, category]) => `<option value="${key}" ${key === (exercise?.category || "base") ? "selected" : ""}>${escapeHtml(category.label)}</option>`).join("")}</select></label>
        <label class="vsg-field">Единица измерения<select class="vsg-input vsg-select" data-catalog-measure>${Object.entries(exerciseMeasures).map(([key, measure]) => `<option value="${key}" ${key === (exercise?.measure || "repeats") ? "selected" : ""}>${escapeHtml(measure.label)}</option>`).join("")}</select></label>
      </div>
      <div class="vsg-sport-catalog-dialog-actions"><button class="vsg-button" type="button" data-catalog-cancel>Отмена</button><button class="vsg-button vsg-button--primary" type="submit">${editing ? "Сохранить" : "Добавить"}</button></div>
    </form>`;

    let result = null;
    const nameInput = dialog.querySelector("[data-catalog-name]");
    nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
    dialog.querySelector("[data-catalog-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.setCustomValidity("Введи название упражнения.");
        nameInput.reportValidity();
        return;
      }
      const duplicate = getExerciseCatalog().some((item) => item.id !== exercise?.id && item.name.trim().toLocaleLowerCase("ru-RU") === name.toLocaleLowerCase("ru-RU"));
      if (duplicate) {
        nameInput.setCustomValidity("Упражнение с таким названием уже есть.");
        nameInput.reportValidity();
        return;
      }
      result = {
        name,
        category: dialog.querySelector("[data-catalog-category]").value,
        measure: dialog.querySelector("[data-catalog-measure]").value
      };
      dialog.close();
    });
    dialog.querySelector("[data-catalog-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      dialog.remove();
      previousFocus?.focus?.();
      resolve(result);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
    nameInput.focus();
    if (editing) nameInput.select();
  });
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
