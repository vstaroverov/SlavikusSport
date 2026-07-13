import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { addLogEntry } from "../features/log/logStorage.js";
import { formatLogText } from "../features/log/logExercises.js";

export default async function addManualLog() {
  const details = await showAddLogDialog();
  if (!details) return;

  const exercise = getExerciseCatalog()[0];
  const results = [{
    name: exercise?.name || "Упражнение",
    target: "",
    weight: "",
    weights: [""],
    sets: 1,
    done: ["0"]
  }];

  addLogEntry({
    id: `manual-log-${Date.now()}`,
    title: details.title.trim() || "Ручная запись",
    finishedAt: formatDateTime(details.dateTime),
    duration: "00:00:00",
    text: formatLogText(results),
    results
  });

  window.dispatchEvent(new Event("app:changed"));
}

function showAddLogDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog log-add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-log-title">
        <div class="confirm-mark">+</div>
        <h2 id="add-log-title">Новая запись</h2>
        <label>
          <span>Название</span>
          <input data-log-title value="Ручная запись" />
        </label>
        <label>
          <span>Дата и время</span>
          <input data-log-date-time type="datetime-local" value="${toDateTimeLocalValue(new Date())}" />
        </label>
        <div class="confirm-actions">
          <button class="secondary-button" data-log-cancel>Отмена</button>
          <button class="primary-button" data-log-submit>Добавить</button>
        </div>
      </section>
    `;

    const close = (value) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const submit = () => close({
      title: overlay.querySelector("[data-log-title]").value,
      dateTime: overlay.querySelector("[data-log-date-time]").value
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
      if (event.key === "Enter") submit();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-log-cancel]").addEventListener("click", () => close(null));
    overlay.querySelector("[data-log-submit]").addEventListener("click", submit);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-log-title]").focus();
    overlay.querySelector("[data-log-title]").select();
  });
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("ru-RU");
}

function toDateTimeLocalValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
