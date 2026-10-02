import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { createLogExerciseDraft, refreshLogExerciseCard } from "./logExerciseDom.js";

export default function addLogExercise(button) {
  const id = button.dataset.logId;
  const entry = getLogEntry(id);
  const results = getLogResults(entry);
  results.push(createLogExerciseDraft(getExerciseCatalog()[0]?.name || "Упражнение"));

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });
  refreshLogExerciseCard(id, results);
}
