import { getRunTrackerStatus, startRunTracker, stopRunTracker } from "./runTracker.js";

export function isRunExercise(exercise) {
  return exercise?.measure === "distanceKm" && String(exercise.name || "").trim().toLocaleLowerCase("ru-RU") === "бег";
}

export function currentRun(session) {
  const exercise = session?.results?.[session.currentExercise];
  return isRunExercise(exercise) ? exercise : null;
}

export async function startAutomaticRunTracking(session) {
  if (!session?.running || !currentRun(session) || window.Capacitor?.getPlatform?.() !== "android") return false;
  if (session.trackerStarted) return true;
  try {
    if ((await getRunTrackerStatus())?.active) await stopRunTracker();
    await startRunTracker();
    session.trackerStarted = true;
    session.trackerError = "";
    return true;
  } catch (error) {
    session.trackerStarted = false;
    session.trackerError = error?.message || "Проверь разрешение на местоположение и включи GPS.";
    return false;
  }
}

export async function stopAutomaticRunTracking(session, { collect = true } = {}) {
  if (window.Capacitor?.getPlatform?.() !== "android") return null;
  if (!session?.trackerStarted) {
    if ((await getRunTrackerStatus())?.active) await stopRunTracker();
    return null;
  }
  const snapshot = await stopRunTracker();
  session.trackerStarted = false;
  const result = currentRun(session);
  if (collect && result && snapshot) {
    result.gpsMeters = Number(result.gpsMeters || 0) + Math.max(0, Number(snapshot.meters || 0));
    result.gpsSeconds = Number(result.gpsSeconds || 0) + Math.max(0, Number(snapshot.seconds || 0));
    if (Array.isArray(snapshot.route) && snapshot.route.length) {
      result.routes = Array.isArray(result.routes) ? result.routes : [];
      result.routes.push(snapshot.route);
    }
  }
  return snapshot;
}

export function getRunTotals(result, liveStatus = null) {
  return {
    meters: Number(result?.gpsMeters || 0) + Math.max(0, Number(liveStatus?.meters || 0)),
    seconds: Number(result?.gpsSeconds || 0) + Math.max(0, Number(liveStatus?.seconds || 0))
  };
}

export function clearRunTrackingData(result) {
  if (!result) return;
  result.gpsMeters = 0;
  result.gpsSeconds = 0;
  result.routes = [];
}
