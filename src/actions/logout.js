import { clearCurrentUser, getCurrentUser } from "../features/profile/profileStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { resetWorkoutData } from "../features/storage/appMigration.js";

export default async function logout() {
  const confirmed = await showConfirmDialog({
    title: "Выйти из профиля?",
    message: "Если не сделать резервную копию, локальные данные могут потеряться. Перед выходом скачай JSON-копию в профиле.",
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
