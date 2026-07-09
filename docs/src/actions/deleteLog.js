import { deleteLogEntry, getLogEntry } from "../features/log/logStorage.js";

export default function deleteLog(button) {
  const entry = getLogEntry(button.dataset.logId);
  if (!entry) return;

  const confirmed = confirm(`Удалить запись "${entry.title}" из лога?`);
  if (!confirmed) return;

  deleteLogEntry(entry.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
