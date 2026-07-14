import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { getBackupSummaryText } from "../features/storage/backupFiles.js";

export default function checkBackup() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.hidden = true;

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) {
      input.remove();
      return;
    }

    try {
      const backup = JSON.parse(await file.text());
      await showConfirmDialog({
        title: "Файл копии",
        message: getBackupSummaryText(backup),
        confirmText: "ОК",
        cancelText: "",
        danger: false
      });
    } catch (error) {
      await showConfirmDialog({
        title: "Ошибка",
        message: error.message || "Не удалось прочитать файл резервной копии.",
        confirmText: "ОК",
        cancelText: "",
        danger: true
      });
    } finally {
      input.remove();
    }
  });

  document.body.append(input);
  input.click();
}
