import { addLogEntry } from "../log/logStorage.js";
import { formatLogText } from "../log/logExercises.js";
import { clearActiveSession, formatSeconds, getElapsedSeconds } from "./workoutTimer.js";

export function finishWorkout(session) {
  const duration = formatSeconds(getElapsedSeconds(session));
  const results = session.results.map((result) => ({
    name: result.name,
    target: result.target,
    weight: result.weight,
    weights: fillMissedSets(result).map(() => normalizeWeight(result.weight)),
    sets: result.sets,
    done: fillMissedSets(result)
  }));
  const text = formatLogText(results);

  addLogEntry({
    id: session.id,
    title: session.title,
    finishedAt: new Date().toLocaleString("ru-RU"),
    duration,
    text,
    results
  });

  clearActiveSession();
}

function normalizeWeight(value) {
  const number = String(value || "").match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  return number.replace(",", ".");
}

function fillMissedSets(result) {
  const done = [...result.done];
  while (done.length < result.sets) {
    done.push("0");
  }
  return done;
}
