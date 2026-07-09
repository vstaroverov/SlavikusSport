import { updateLogDetails } from "../features/log/logStorage.js";

export default function editLog(button) {
  const id = button.dataset.logId;
  const text = document.querySelector(`[data-log-text="${id}"]`);
  const dateInput = document.querySelector(`[data-log-date="${id}"]`);
  const dateLabel = document.querySelector(`[data-log-date-label="${id}"]`);
  const editing = text.getAttribute("contenteditable") === "true";

  if (editing) {
    const finishedAt = formatDateTime(dateInput.value);
    updateLogDetails(id, {
      text: text.innerText.trim(),
      finishedAt
    });
    text.setAttribute("contenteditable", "false");
    dateInput.hidden = true;
    dateLabel.hidden = false;
    dateLabel.textContent = finishedAt;
    button.textContent = "Изменить";
    return;
  }

  text.setAttribute("contenteditable", "true");
  dateInput.hidden = false;
  dateLabel.hidden = true;
  text.focus();
  button.textContent = "Сохранить";
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("ru-RU");
}
