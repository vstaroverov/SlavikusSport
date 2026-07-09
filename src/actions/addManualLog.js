import { addLogEntry } from "../features/log/logStorage.js";

export default function addManualLog() {
  const title = prompt("Название записи", "Ручная запись");
  if (title === null) return;

  const text = prompt("Что добавить в лог?", "");
  if (text === null) return;

  addLogEntry({
    id: `manual-log-${Date.now()}`,
    title: title.trim() || "Ручная запись",
    finishedAt: new Date().toLocaleString("ru-RU"),
    duration: "00:00:00",
    text: text.trim() || "Новая запись",
    results: []
  });

  window.dispatchEvent(new Event("app:changed"));
}
