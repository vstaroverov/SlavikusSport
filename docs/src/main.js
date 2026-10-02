import { createApp } from "./app/App.js";
import { initializePersistentStorage } from "./features/storage/persistentStorage.js";
import { registerServiceWorker } from "./features/pwa/registerServiceWorker.js";

const root = document.querySelector("#app");
try {
  await initializePersistentStorage();
  registerServiceWorker();
  createApp(root);
} catch (error) {
  console.error("Не удалось открыть локальную базу", error);
  root.textContent = "Не удалось открыть локальную базу данных. Данные не удалены. Перезапусти приложение.";
}
