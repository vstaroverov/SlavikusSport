import { addLogEntry } from "../log/logStorage.js";
import { formatLogText } from "../log/logExercises.js";
import { clearActiveSession, formatSeconds, getElapsedSeconds } from "./workoutTimer.js";

export function finishWorkout(session) {
  const duration = formatSeconds(getElapsedSeconds(session));
  const results = session.results.flatMap((result) => {
    const completedIndexes = (result.done || [])
      .map((value, index) => isCompletedValue(value) ? index : -1)
      .filter((index) => index >= 0);
    if (!completedIndexes.length) return [];
    const done = completedIndexes.map((index) => String(result.done[index]));
    return {
      name: result.name,
      measure: result.measure || "",
      target: result.target,
      weight: result.weight,
      weights: completedIndexes.map((index) => normalizeWeight(result.weights?.[index] || result.weight)),
      times: Array.isArray(result.times) ? completedIndexes.map((index) => result.times[index] || 0) : [],
      routes: Array.isArray(result.routes) ? result.routes : [],
      sets: done.length,
      done
    };
  });
  if (!results.length) {
    clearActiveSession();
    return null;
  }
  const text = formatLogText(results);

  const entry = {
    id: session.id,
    title: session.title,
    finishedAt: new Date().toLocaleString("ru-RU"),
    duration,
    text,
    results
  };

  addLogEntry(entry);

  clearActiveSession();
  return entry;
}

function normalizeWeight(value) {
  const text = String(value || "");
  if (/\d+\s*(с|сек|секунд|мин|минут|ч|час)/i.test(text)) return "";
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  const normalized = Number(number.replace(",", "."));
  return normalized > 0 ? String(normalized) : "";
}

function isCompletedValue(value) {
  const text = String(value || "").trim();
  if (text === "+") return true;
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  return Number(number.replace(",", ".")) > 0;
}
