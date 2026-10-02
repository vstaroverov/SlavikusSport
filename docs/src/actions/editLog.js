import { beginLogEdit, deleteLogEntry, finishLogEdit, getLogEntries, getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, formatLogTextWithRecords, getLogResults } from "../features/log/logExercises.js";
import { collectLogExerciseRows } from "./logExerciseDom.js";

export default function editLog(button) {
  const id = button.dataset.logId;
  const text = document.querySelector(`[data-log-text="${id}"]`);
  const editor = document.querySelector(`[data-log-editor="${id}"]`);
  const dateInput = document.querySelector(`[data-log-date="${id}"]`);
  const dateLabel = document.querySelector(`[data-log-date-label="${id}"]`);
  const editing = !editor.hidden;

  if (editing) {
    const currentEntry = getLogEntry(id);
    const results = collectLogExerciseRows(id, getLogResults(currentEntry || {}));
    const finishedAt = formatDateTime(dateInput.value);
    const nextText = formatLogText(results);

    if (!results.some((result) => result.done.some((value) => hasCompletedValue(value)))) {
      deleteLogEntry(id);
      window.dispatchEvent(new Event("app:changed"));
      return;
    }

    updateLogDetails(id, { results, text: nextText, finishedAt });
    finishLogEdit(id);
    const entry = getLogEntry(id);
    const shownText = entry ? formatLogTextWithRecords(entry, getLogEntries()) || nextText : nextText;
    text.textContent = shownText;
    const recordBadge = button.closest(".vsg-sport-log-card")?.querySelector(`[data-log-record="${id}"]`);
    if (recordBadge) recordBadge.hidden = !shownText.includes("★");
    text.hidden = false;
    editor.hidden = true;
    dateInput.hidden = true;
    dateLabel.hidden = false;
    dateLabel.textContent = finishedAt;
    button.textContent = "Изменить";
    return;
  }

  beginLogEdit(id);
  editor.hidden = false;
  text.hidden = true;
  dateInput.hidden = false;
  dateLabel.hidden = true;
  button.textContent = "Сохранить";
}

function hasCompletedValue(value) {
  const text = String(value || "").trim();
  return text === "+" || /^выполнен[ао]?$/i.test(text)
    || (text.match(/\d+(?:[.,]\d+)?/g) || []).some((number) => Number(number.replace(",", ".")) > 0);
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("ru-RU");
}
