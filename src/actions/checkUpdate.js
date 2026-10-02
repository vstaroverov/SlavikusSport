import { showProfileDialog } from "../components/ProfileDialog.js";

export default async function checkUpdate() {
  if (!("serviceWorker" in navigator)) {
    await showProfileDialog({
      title: "Обновление",
      message: "Проверка обновления недоступна в этом браузере.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration("./");
    await registration?.update();
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });

    await showProfileDialog({
      title: "Обновление",
      message: "Проверка выполнена. Если новая версия доступна, закрой и снова открой приложение.",
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
  } catch {
    await showProfileDialog({
      title: "Обновление",
      message: "Не удалось проверить обновление. Проверь интернет и попробуй еще раз.",
      confirmText: "ОК",
      cancelText: "",
      danger: true,
      icon: "warning"
    });
  }
}
