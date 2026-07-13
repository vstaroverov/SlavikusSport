import { clearCurrentUser } from "../features/profile/profileStorage.js";
import { showConfirmDialog } from "../components/ConfirmDialog.js";

export default async function logout() {
  const confirmed = await showConfirmDialog({
    title: "Выйти из профиля?",
    message: "Если не сделать резервную копию, локальные данные могут потеряться. Перед выходом скачай JSON-копию в профиле.",
    confirmText: "Выйти",
    cancelText: "Отмена",
    danger: true
  });

  if (!confirmed) return;

  clearCurrentUser();
  window.location.hash = "";
  window.dispatchEvent(new CustomEvent("app:changed"));
}
