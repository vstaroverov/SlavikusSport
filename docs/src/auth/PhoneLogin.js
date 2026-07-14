import { showConfirmDialog } from "../components/ConfirmDialog.js";

export function loginPhone() {
  showConfirmDialog({
    title: "Скоро",
    message: "Вход по телефону добавим следующим способом авторизации.",
    confirmText: "ОК",
    cancelText: "",
    danger: false
  });
}
