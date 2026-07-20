import { showConfirmDialog } from "../../components/ConfirmDialog.js";
import { exportBackup } from "./persistentStorage.js";

const LAST_BACKUP_KEY = "slavikus:last-backup-at";
const FRESH_BACKUP_HOURS = 24;

export async function downloadBackupFile() {
  const backup = await exportBackup();
  const now = new Date();
  const fileName = `slavikus-sport-backup-${formatFileDate(now)}.json`;
  const backupText = JSON.stringify(backup, null, 2);
  const blob = new Blob([backupText], { type: "application/json" });

  if (isAndroidApp()) {
    const shared = await shareAndroidBackup(fileName, backupText, blob);
    if (!shared) return false;
  } else {
    downloadBlob(fileName, blob);
  }

  localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
  window.dispatchEvent(new CustomEvent("app:changed"));
  return true;
}

function downloadBlob(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function shareAndroidBackup(fileName, backupText, blob) {
  const nativeShared = await shareNativeAndroidBackup(fileName, backupText);
  if (nativeShared) return true;

  const file = new File([blob], fileName, { type: "application/json" });
  const data = {
    title: "Резервная копия Slavikus Sport",
    text: "Сохрани JSON-файл резервной копии.",
    files: [file]
  };

  if (!navigator.share || (navigator.canShare && !navigator.canShare({ files: [file] }))) {
    await showConfirmDialog({
      title: "Не удалось сохранить файл",
      message: "Android WebView не дал открыть сохранение файла. Попробуй сделать резервную копию в веб-версии.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if (error?.name === "AbortError") return false;
    await showConfirmDialog({
      title: "Не удалось сохранить файл",
      message: "Системное сохранение файла не завершилось. Попробуй еще раз.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
    return false;
  }
}

async function shareNativeAndroidBackup(fileName, backupText) {
  const plugins = window.Capacitor?.Plugins || {};
  const filesystem = plugins.Filesystem;
  const share = plugins.Share;

  if (!filesystem?.writeFile || !share?.share) return false;

  let result;
  try {
    result = await filesystem.writeFile({
      path: fileName,
      data: backupText,
      directory: "CACHE",
      encoding: "utf8"
    });
  } catch {
    return false;
  }

  try {
    await share.share({
      title: "Резервная копия Slavikus Sport",
      text: "Сохрани JSON-файл резервной копии.",
      files: [result.uri],
      dialogTitle: "Сохранить резервную копию"
    });
  } catch {
    // Android share targets may report cancellation even after the file was saved.
  }

  return true;
}

function isAndroidApp() {
  return window.Capacitor?.getPlatform?.() === "android";
}

export function getLastBackupLabel() {
  const value = localStorage.getItem(LAST_BACKUP_KEY);
  if (!value) return "Еще не создавалась";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Еще не создавалась";

  return date.toLocaleString("ru-RU");
}

export function getBackupFreshness() {
  const value = localStorage.getItem(LAST_BACKUP_KEY);
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return {
      isFresh: false,
      label: "Копии нет",
      warning: "Резервная копия еще не создавалась."
    };
  }

  const ageMs = Date.now() - date.getTime();
  const ageHours = Math.max(0, Math.floor(ageMs / 36e5));

  if (ageHours < FRESH_BACKUP_HOURS) {
    return {
      isFresh: true,
      label: "Копия свежая",
      warning: `Последняя копия была ${formatAge(ageHours)} назад.`
    };
  }

  return {
    isFresh: false,
    label: "Копия устарела",
    warning: `Последняя копия была ${formatAge(ageHours)} назад. Лучше скачать свежий JSON.`
  };
}

export async function promptWorkoutBackup() {
  if (window.Capacitor?.getPlatform?.() === "android") return;

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

function formatAge(hours) {
  if (hours < 1) return "меньше часа";
  if (hours < 24) return `${hours} ч`;

  const days = Math.floor(hours / 24);
  return `${days} дн`;
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
