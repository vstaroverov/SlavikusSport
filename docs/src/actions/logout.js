import { clearCurrentUser, getCurrentUser } from "../features/profile/profileStorage.js";
import { showProfileDialog, showProfileChoiceDialog } from "../components/ProfileDialog.js";
import { resetWorkoutData } from "../features/storage/appMigration.js";
import { downloadBackupFile, getBackupFreshness } from "../features/storage/backupFiles.js";
import { getRunTrackerStatus, stopRunTracker } from "../features/workout/runTracker.js";

export default async function logout() {
  const backup = getBackupFreshness();

  if (!backup.isFresh) {
    const choice = await showProfileChoiceDialog({
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

  const confirmed = await showProfileDialog({
    title: "Выйти из профиля?",
    message: `${backup.warning}\nВыйти и очистить локальные данные?`,
    confirmText: "Выйти",
    cancelText: "Отмена",
    danger: true
  });

  if (!confirmed) return;

  if ((await getRunTrackerStatus())?.active) await stopRunTracker();
  const user = getCurrentUser();
  resetWorkoutData(user?.id);
  clearCurrentUser();
  window.location.hash = "";
  window.dispatchEvent(new CustomEvent("app:changed"));
}
