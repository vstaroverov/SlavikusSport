import { addLogEntry } from "../features/log/logStorage.js";

export default function addManualLog() {
  const title = prompt("Название записи", "Ручная запись");
  if (title === null) return;

  const dateTime = prompt("Дата и время тренировки", toDateTimeLocalValue(new Date()));
  if (dateTime === null) return;

  const text = prompt("Что добавить в лог?", "");
  if (text === null) return;

  addLogEntry({
    id: `manual-log-${Date.now()}`,
    title: title.trim() || "Ручная запись",
    finishedAt: formatDateTime(dateTime),
    duration: "00:00:00",
    text: text.trim() || "Новая запись",
    results: []
  });

  window.dispatchEvent(new Event("app:changed"));
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
