import { showConfirmDialog } from "../components/ConfirmDialog.js";

export function loginEmail() {
  showConfirmDialog({
    title: "Скоро",
    message: "Вход по почте добавим следующим способом авторизации.",
    confirmText: "ОК",
    cancelText: "",
    danger: false
  });
}
