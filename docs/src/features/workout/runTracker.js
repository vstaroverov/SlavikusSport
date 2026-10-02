import { getActiveSession } from "./workoutTimer.js";

function plugin() {
  const capacitor = window.Capacitor;
  if (!capacitor?.isPluginAvailable?.("RunTracker")) return null;
  return capacitor.Plugins?.RunTracker || capacitor.registerPlugin?.("RunTracker") || null;
}

export async function getRunTrackerStatus() {
  if (!plugin()) return null;
  return plugin().status();
}

export async function startRunTracker() {
  if (!plugin()) throw new Error("GPS-трекер доступен только в приложении Android.");
  return plugin().start();
}

export async function stopRunTracker() {
  if (!plugin()) return null;
  return plugin().stop();
}

export function renderRunTrackerStatus(root, status) {
  const panel = root?.querySelector("[data-run-tracker]");
  if (!panel) return;
  const session = getActiveSession();
  const result = session?.results?.[session.currentExercise];
  const live = session?.trackerStarted && status?.active ? status : null;
  const meters = Number(result?.gpsMeters || 0) + Number(live?.meters || 0);
  const seconds = Number(result?.gpsSeconds || 0) + Number(live?.seconds || 0);
  const distance = (meters / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  const totals = `${distance} км · ${formatDuration(seconds)}`;
  panel.querySelector("[data-run-tracker-status]").textContent = session?.trackerError
    ? `GPS недоступен: ${session.trackerError} Введи дистанцию и время вручную.`
    : session?.running && live
      ? `GPS записывает маршрут · ${totals}`
      : session?.running && session?.trackerStarted
        ? `GPS запускается · ${totals}`
        : session?.running
          ? `GPS не записывает · ${totals}. Введи дистанцию и время вручную.`
          : `GPS на паузе · ${totals}`;
}

function formatDuration(total) {
  const minutes = Math.floor(Number(total) / 60);
  const seconds = String(Math.floor(Number(total) % 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
