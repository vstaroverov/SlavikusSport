import { deleteLogEntry, getLogEntry } from "../features/log/logStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function deleteLog(button) {
  const entry = getLogEntry(button.dataset.logId);
  if (!entry) return;

  const confirmed = await showConfirmDialog({
    title: "Удалить запись?",
    message: `Запись "${entry.title}" исчезнет из лога.`,
    confirmText: "Удалить"
  });
  if (!confirmed) return;

  deleteLogEntry(entry.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
