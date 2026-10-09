import { createApp } from "./app/App.js";
import { initializePersistentStorage } from "./features/storage/persistentStorage.js";

const root = document.querySelector("#app");
const bridge = window.vkBridge;

if (bridge?.isEmbedded()) {
  const updateSwipe = () => {
    bridge.send("VKWebAppSetSwipeSettings", {
      history: window.location.hash === "" || window.location.hash === "#/main"
    }).catch(() => {});
  };
  window.addEventListener("hashchange", updateSwipe);
  bridge.send("VKWebAppInit")
    .then(updateSwipe)
    .catch((error) => console.error("VK Bridge initialization failed", error));
}

try {
  await initializePersistentStorage();
  createApp(root);
} catch (error) {
  console.error("Не удалось открыть локальную базу", error);
  root.textContent = "Не удалось открыть локальную базу данных. Данные не удалены. Перезапусти приложение.";
}
