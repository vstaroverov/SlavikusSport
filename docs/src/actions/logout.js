import { clearCurrentUser, getCurrentUser } from "../features/profile/profileStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { showChoiceDialog } from "../components/InputDialog.js";
import { resetWorkoutData } from "../features/storage/appMigration.js";
import { downloadBackupFile, getBackupFreshness } from "../features/storage/backupFiles.js";

export default async function logout() {
  const backup = getBackupFreshness();

  if (!backup.isFresh) {
    const choice = await showChoiceDialog({
      title: "Резервная копия",
      message: `${backup.warning}\nПосле выхода локальные данные очистятся.`,
      choices: [
        { value: "backup", label: "Скачать копию", caption: "сначала JSON" },
        { value: "logout", label: "Выйти без копии", caption: "данные очистятся" }
      ],
      cancelText: "Остаться"
    });

    if (choice === "backup") {
      await downloadBackupFile();
      return;
    }

    if (choice !== "logout") return;
  }

  const confirmed = await showConfirmDialog({
    title: "Выйти из профиля?",
    message: `${backup.warning}\nВыйти и очистить локальные данные?`,
    confirmText: "Выйти",
    cancelText: "Отмена",
    danger: true
  });

  if (!confirmed) return;

  const user = getCurrentUser();
  resetWorkoutData(user?.id);
  clearCurrentUser();
  window.location.hash = "";
  window.dispatchEvent(new CustomEvent("app:changed"));
}
