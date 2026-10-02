import { appStorage } from "../storage/persistentStorage.js";
import { getWorkout } from "../program/programStorage.js";
import { getWeightedVariantName, hasAddedWeight } from "../exercises/exercisesStorage.js";

const SESSION_KEY = "slavikus:active-workout";

export function getActiveSession() {
  const session = JSON.parse(appStorage.getItem(SESSION_KEY) || "null");
  if (!session?.results?.some((result) => !result.measure || (
    String(result.name || "").trim().toLocaleLowerCase("ru-RU") === "вис"
    && (result.measure !== "seconds" || result.weight || result.weights?.some(Boolean) || /[^\d]/.test(String(result.target || "")))
  ) || ["разминка", "заминка"].includes(String(result.name || "").trim().toLocaleLowerCase("ru-RU")) && result.measure !== "completion"
    || getWeightedVariantName(result.name) && (result.measure === "weighted" || hasAddedWeight(result)))) return session;
  const workout = getWorkout(session.workoutId);
  if (!workout) return session;
  let changed = false;
  session.results.forEach((result, index) => {
    const exercise = workout.exercises[index];
    if (!exercise) return;
    if (exercise.name === getWeightedVariantName(result.name) && (result.measure === "weighted" || hasAddedWeight(result))) {
      result.name = exercise.name;
      result.measure = "weighted";
      changed = true;
    }
    if (result.name !== exercise.name) return;
    if (exercise.measure === "completion" && result.measure !== "completion") {
      result.measure = "completion";
      result.target = "";
      result.weight = "";
      result.time = "";
      result.sets = 1;
      result.weights = (result.weights || []).map(() => "");
      changed = true;
      return;
    }
    if (exercise.measure === "seconds" && String(exercise.name).trim().toLocaleLowerCase("ru-RU") === "вис") {
      if (result.measure !== "seconds" || result.target !== exercise.target || result.weight || result.weights?.some(Boolean)) {
        result.measure = "seconds";
        result.target = exercise.target;
        result.weight = "";
        result.weights = (result.weights || []).map(() => "");
        changed = true;
      }
      return;
    }
    if (result.measure) return;
    result.measure = exercise.measure;
    if ((result.measure === "distanceKm" || result.measure === "distanceM")
      && !result.done?.length && session.currentSet === 1
      && String(result.target) === "10" && Number(result.sets) === 3
      && Number(exercise.sets) === 1 && exercise.target === "") {
      result.target = "";
      result.sets = 1;
    }
    changed = true;
  });
  if (changed) saveActiveSession(session);
  return session;
}

export function saveActiveSession(session) {
  appStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSession() {
  appStorage.removeItem(SESSION_KEY);
}

export function formatSeconds(total) {
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function getElapsedSeconds(session) {
  if (!session) return 0;
  const running = session.running ? Math.floor((Date.now() - session.startedAt) / 1000) : 0;
  return session.elapsed + running;
}

export function getRestRemainingSeconds(session) {
  if (!session?.restStartedAt || !session?.restDuration) return 0;

  const passed = Math.floor((Date.now() - session.restStartedAt) / 1000);
  return Math.max(0, Number(session.restDuration) - passed);
}
