import { addExerciseToCatalog, exerciseCategories } from "../features/exercises/exercisesStorage.js";

export default async function addCatalogExercise() {
  const details = await showExerciseDialog();
  if (!details?.name.trim()) return;

  addExerciseToCatalog(details.name.trim(), details.category);
  window.dispatchEvent(new Event("app:changed"));
}

function showExerciseDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog log-add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-exercise-title">
        <div class="confirm-mark">+</div>
        <h2 id="add-exercise-title">Новое упражнение</h2>
        <label>
          <span>Название</span>
          <input data-exercise-name placeholder="Например: Развод ног сидя" />
        </label>
        <label>
          <span>Категория</span>
          <select data-exercise-category>
            ${Object.entries(exerciseCategories).map(([id, category]) => `
              <option value="${id}" ${id === "base" ? "selected" : ""}>${escapeHtml(category.label)}</option>
            `).join("")}
          </select>
        </label>
        <div class="confirm-actions">
          <button class="secondary-button" data-exercise-cancel>Отмена</button>
          <button class="primary-button" data-exercise-submit>Добавить</button>
        </div>
      </section>
    `;

    const close = (value) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const submit = () => close({
      name: overlay.querySelector("[data-exercise-name]").value,
      category: overlay.querySelector("[data-exercise-category]").value
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
      if (event.key === "Enter") submit();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-exercise-cancel]").addEventListener("click", () => close(null));
    overlay.querySelector("[data-exercise-submit]").addEventListener("click", submit);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-exercise-name]").focus();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
