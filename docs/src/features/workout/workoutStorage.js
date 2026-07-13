import { addLogEntry } from "../log/logStorage.js";
import { formatLogText } from "../log/logExercises.js";
import { clearActiveSession, formatSeconds, getElapsedSeconds } from "./workoutTimer.js";

export function finishWorkout(session) {
  const duration = formatSeconds(getElapsedSeconds(session));
  const results = session.results.map((result) => {
    const done = fillMissedSets(result);
    return {
      name: result.name,
      target: result.target,
      weight: result.weight,
      weights: fillMissedWeights(result, done.length),
      sets: result.sets,
      done
    };
  });
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
  const text = String(value || "");
  if (/\d+\s*(с|сек|секунд|мин|минут|ч|час)/i.test(text)) return "";
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  const normalized = Number(number.replace(",", "."));
  return normalized > 0 ? String(normalized) : "";
}

function fillMissedSets(result) {
  const done = [...result.done];
  while (done.length < result.sets) {
    done.push("0");
  }
  return done;
}

function fillMissedWeights(result, length) {
  const defaultWeight = normalizeWeight(result.weight);
  const weights = Array.isArray(result.weights)
    ? result.weights.map((value) => normalizeWeight(value))
    : [];

  while (weights.length < length) {
    weights.push(defaultWeight);
  }

  return weights.slice(0, length);
}
