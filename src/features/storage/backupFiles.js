import { showConfirmDialog } from "../../components/ConfirmDialog.js";
import { exportBackup } from "./persistentStorage.js";

const LAST_BACKUP_KEY = "slavikus:last-backup-at";

export async function downloadBackupFile() {
  const backup = await exportBackup();
  const now = new Date();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `slavikus-sport-backup-${formatFileDate(now)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
  window.dispatchEvent(new CustomEvent("app:changed"));
}

export function getLastBackupLabel() {
  const value = localStorage.getItem(LAST_BACKUP_KEY);
  if (!value) return "Еще не создавалась";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Еще не создавалась";

  return date.toLocaleString("ru-RU");
}

export async function promptWorkoutBackup() {
  const confirmed = await showConfirmDialog({
    title: "Обновить резервную копию?",
    message: "Скачай JSON-файл и сохрани его в Файлы > На iPhone > SlavikusSportData. Браузер не может сам обновить файл без твоего выбора.",
    confirmText: "Скачать JSON",
    cancelText: "Позже",
    danger: false
  });

  if (confirmed) {
    await downloadBackupFile();
  }
}

function formatFileDate(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}
