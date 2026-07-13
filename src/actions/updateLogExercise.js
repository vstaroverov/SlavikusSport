import { getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { collectLogExerciseRows } from "./logExerciseDom.js";

export default function updateLogExercise(input) {
  const id = input.dataset.logId;
  const entry = getLogEntry(id);
  const currentResults = getLogResults(entry);
  const results = collectLogExerciseRows(id);

  if (!results.length && currentResults.length) return;

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });

  const text = document.querySelector(`[data-log-text="${id}"]`);
  if (text) text.textContent = formatLogText(results);
}
