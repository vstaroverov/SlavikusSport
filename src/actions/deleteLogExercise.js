import { getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { refreshLogExerciseCard } from "./logExerciseDom.js";

export default function deleteLogExercise(button) {
  const id = button.dataset.logId;
  const index = Number(button.dataset.exerciseIndex);
  const entry = getLogEntry(id);
  const results = getLogResults(entry).filter((_, resultIndex) => resultIndex !== index);

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });
  refreshLogExerciseCard(id, results);
}
