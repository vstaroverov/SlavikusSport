import { addLogEntry } from "../features/log/logStorage.js";
import editLog from "./editLog.js";

export default async function addManualLog() {
  const details = await showAddLogDialog();
  if (!details) return;

  const id = `manual-log-${Date.now()}`;
  addLogEntry({
    id,
    title: details.title.trim() || "Ручная запись",
    finishedAt: formatDateTime(details.dateTime),
    duration: "00:00:00",
    text: "",
    results: [],
    draft: true
  });

  window.dispatchEvent(new Event("app:changed"));
  const editButton = document.querySelector(`[data-action="editLog"][data-log-id="${id}"]`);
  if (editButton) {
    editLog(editButton);
    editButton.focus();
  }
}

function showAddLogDialog() {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-log-add-dialog";
    dialog.setAttribute("aria-labelledby", "add-log-title");
    dialog.setAttribute("aria-describedby", "add-log-description");
    dialog.innerHTML = `
      <form method="dialog" class="vsg-sport-log-add-form">
        <div class="vsg-sport-log-add-head">
          <span class="vsg-sport-log-add-mark" aria-hidden="true">+</span>
          <div><span class="vsg-eyebrow">Лог тренировок</span><h2 id="add-log-title">Новая запись</h2></div>
        </div>
        <p class="vsg-sport-log-add-copy" id="add-log-description">Укажите название и дату. После создания добавьте упражнения и результаты.</p>
        <div class="vsg-sport-log-add-fields">
          <label class="vsg-field">Название<input class="vsg-input" data-log-title value="Ручная запись" autocomplete="off" /></label>
          <label class="vsg-field">Дата и время<input class="vsg-input" data-log-date-time type="datetime-local" value="${toDateTimeLocalValue(new Date())}" required /></label>
        </div>
        <div class="vsg-sport-log-add-actions">
          <button class="vsg-button" type="button" data-log-cancel>Отмена</button>
          <button class="vsg-button vsg-button--primary" type="submit" value="add">Создать запись</button>
        </div>
      </form>
    `;
    dialog.addEventListener("close", () => {
      const details = dialog.returnValue === "add" ? {
        title: dialog.querySelector("[data-log-title]").value,
        dateTime: dialog.querySelector("[data-log-date-time]").value
      } : null;
      dialog.remove();
      previousFocus?.focus?.();
      resolve(details);
    }, { once: true });
    dialog.querySelector("[data-log-cancel]").addEventListener("click", () => dialog.close("cancel"));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close("cancel");
    });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-log-title]").focus();
    dialog.querySelector("[data-log-title]").select();
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
