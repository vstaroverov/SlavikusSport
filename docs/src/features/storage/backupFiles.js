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

export function getBackupSummaryText(backup) {
  if (!backup?.data || typeof backup.data !== "object") {
    throw new Error("Некорректный файл резервной копии.");
  }

  const data = backup.data;
  const calendarKey = Object.keys(data).find((key) => /^slavikus:calendar:/.test(key));
  const exportedAt = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString("ru-RU") : "не указана";

  return [
    `Дата копии: ${exportedAt}`,
    `Лог: ${countJsonArray(findFirstValue(data, /^slavikus:log:/))} записей`,
    `Программа: ${countJsonArray(data["slavikus:workouts"])} тренировок`,
    `Упражнения: ${countJsonArray(data["slavikus:exercise-catalog"])}`,
    `Календарь: ${Object.keys(parseJson(data[calendarKey] || "{}") || {}).length} дат`
  ].join("\n");
}

function formatFileDate(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function findFirstValue(data, pattern) {
  const key = Object.keys(data).find((item) => pattern.test(item));
  return key ? data[key] : "";
}

function countJsonArray(value) {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed.length : 0;
}

function parseJson(value) {
  try {
    return JSON.parse(value || "null");
  } catch {
    return null;
  }
}
