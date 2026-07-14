import { importBackup } from "../features/storage/persistentStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { getBackupSummaryText } from "../features/storage/backupFiles.js";

export default function importBackupAction() {
  showConfirmDialog({
    title: "Восстановить копию",
    message: "Выбери JSON-файл из папки Файлы > На iPhone > SlavikusSportData, если она есть.",
    confirmText: "Выбрать файл",
    cancelText: "Отмена",
    danger: false
  }).then((confirmed) => {
    if (confirmed) openBackupFilePicker();
  });
}

function openBackupFilePicker() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const backup = JSON.parse(await file.text());
      const summary = getBackupSummaryText(backup);
      await importBackup(backup);
      window.dispatchEvent(new Event("app:changed"));
      await showConfirmDialog({
        title: "Готово",
        message: `Файл с параметрами загружен.\n\n${summary}`,
        confirmText: "ОК",
        cancelText: "",
        danger: false
      });
    } catch (error) {
      await showConfirmDialog({
        title: "Ошибка",
        message: error.message || "Не удалось восстановить резервную копию.",
        confirmText: "ОК",
        cancelText: "",
        danger: true
      });
    }
  });

  input.click();
}
