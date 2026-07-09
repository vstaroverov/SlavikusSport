import { addLogEntry } from "../log/logStorage.js";
import { clearActiveSession, formatSeconds, getElapsedSeconds } from "./workoutTimer.js";

export function finishWorkout(session) {
  const duration = formatSeconds(getElapsedSeconds(session));
  const results = session.results.map((result) => ({
    name: result.name,
    target: result.target,
    weight: result.weight,
    sets: result.sets,
    done: fillMissedSets(result)
  }));
  const text = results.map((result) => {
    const weight = result.weight ? ` (${result.weight})` : "";
    return `${result.name}${weight}: ${result.done.join(" / ")}`;
  }).join("\n");

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

function fillMissedSets(result) {
  const done = [...result.done];
  while (done.length < result.sets) {
    done.push("0");
  }
  return done;
}
