import { createApp } from "./app/App.js";
import { initializePersistentStorage } from "./features/storage/persistentStorage.js";
import { registerServiceWorker } from "./features/pwa/registerServiceWorker.js";

await initializePersistentStorage();
registerServiceWorker();
createApp(document.querySelector("#app"));
