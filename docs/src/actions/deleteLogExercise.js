import { getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { collectLogExerciseRows, refreshLogExerciseCard } from "./logExerciseDom.js";

export default function deleteLogExercise(button) {
  const id = button.dataset.logId;
  const index = Number(button.dataset.exerciseIndex);
  const entry = getLogEntry(id);
  const currentRows = collectLogExerciseRows(id);
  const sourceResults = currentRows.length ? currentRows : getLogResults(entry);
  const results = sourceResults.filter((_, resultIndex) => resultIndex !== index);

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });
  refreshLogExerciseCard(id, results);
}
