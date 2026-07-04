import { clearLogEntries } from "../features/log/logStorage.js";

export default function clearLog() {
  const confirmed = confirm("Очистить весь лог тренировок?");
  if (!confirmed) return;

  clearLogEntries();
  window.dispatchEvent(new CustomEvent("app:changed"));
}
