import { beginLogEdit, getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { collectLogExerciseRows, createLogExerciseDraft, refreshLogExerciseCard } from "./logExerciseDom.js";

export default function updateLogExercise(input) {
  const id = input.dataset.logId;
  const entry = getLogEntry(id);
  const currentResults = getLogResults(entry);
  const results = collectLogExerciseRows(id, currentResults);

  if (!results.length && currentResults.length) return;
  if (input.dataset.field === "name") {
    beginLogEdit(id);
    const index = Number(input.dataset.exerciseIndex);
    if (results[index]) {
      results[index] = createLogExerciseDraft(input.value, currentResults[index]?.measure || "repeats");
    }
  }

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });

  const text = document.querySelector(`[data-log-text="${id}"]`);
  if (text) text.textContent = formatLogText(results);
  if (input.dataset.field === "name") {
    refreshLogExerciseCard(id, results);
    document.querySelector(`[data-log-editor="${id}"]`)
      ?.querySelectorAll(".vsg-sport-log-edit-row")[Number(input.dataset.exerciseIndex)]
      ?.querySelector('[data-field="name"]')?.focus();
  }
}
