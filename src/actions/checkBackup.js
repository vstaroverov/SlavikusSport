import { showProfileDialog } from "../components/ProfileDialog.js";
import { getBackupSummaryText } from "../features/storage/backupFiles.js";
import { chooseBackupFile } from "../components/BackupFileDialog.js";

export default async function checkBackup(trigger) {
  const file = await chooseBackupFile({
    title: "Проверить копию",
    message: "Выбери JSON-файл резервной копии. Данные приложения не изменятся.",
    returnFocus: trigger
  });
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    await showProfileDialog({
      title: "Файл копии",
      message: getBackupSummaryText(backup),
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
  } catch (error) {
    await showProfileDialog({
      title: "Ошибка",
      message: error.message || "Не удалось прочитать файл резервной копии.",
      confirmText: "ОК",
      cancelText: "",
      danger: true,
      icon: "warning"
    });
  }
}
