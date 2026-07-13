import { clearLogEntries } from "../features/log/logStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function clearLog() {
  const confirmed = await showConfirmDialog({
    title: "Очистить лог?",
    message: "Все записи тренировок текущего пользователя будут удалены.",
    confirmText: "Очистить"
  });
  if (!confirmed) return;

  clearLogEntries();
  window.dispatchEvent(new CustomEvent("app:changed"));
}
