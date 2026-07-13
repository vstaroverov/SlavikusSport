import { updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText } from "../features/log/logExercises.js";
import { collectLogExerciseRows } from "./logExerciseDom.js";

export default function editLog(button) {
  const id = button.dataset.logId;
  const text = document.querySelector(`[data-log-text="${id}"]`);
  const editor = document.querySelector(`[data-log-editor="${id}"]`);
  const dateInput = document.querySelector(`[data-log-date="${id}"]`);
  const dateLabel = document.querySelector(`[data-log-date-label="${id}"]`);
  const editing = !editor.hidden;

  if (editing) {
    const results = collectLogExerciseRows(id);
    const finishedAt = formatDateTime(dateInput.value);
    const nextText = formatLogText(results);

    updateLogDetails(id, { results, text: nextText, finishedAt });
    text.textContent = nextText;
    editor.hidden = true;
    dateInput.hidden = true;
    dateLabel.hidden = false;
    dateLabel.textContent = finishedAt;
    button.textContent = "Изменить";
    return;
  }

  editor.hidden = false;
  dateInput.hidden = false;
  dateLabel.hidden = true;
  button.textContent = "Сохранить";
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("ru-RU");
}
