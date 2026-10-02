import { clearLogEntries } from "../features/log/logStorage.js";
import { showProfileDialog } from "../components/ProfileDialog.js";

export default async function clearLog() {
  const confirmed = await showProfileDialog({
    title: "Очистить лог?",
    message: "Все записи тренировок текущего пользователя будут удалены.",
    confirmText: "Очистить лог",
    cancelText: "Отмена",
    danger: true
  });
  if (!confirmed) return;

  clearLogEntries();
  window.dispatchEvent(new CustomEvent("app:changed"));
}
