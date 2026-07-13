import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";
import { getLogEntry, updateLogDetails } from "../features/log/logStorage.js";
import { formatLogText, getLogResults } from "../features/log/logExercises.js";
import { refreshLogExerciseCard } from "./logExerciseDom.js";

export default function addLogExercise(button) {
  const id = button.dataset.logId;
  const entry = getLogEntry(id);
  const results = getLogResults(entry);
  const exercise = getExerciseCatalog()[0];

  results.push({
    name: exercise?.name || "Упражнение",
    target: "",
    weight: "",
    weights: [""],
    sets: 1,
    done: ["0"]
  });

  updateLogDetails(id, {
    results,
    text: formatLogText(results)
  });
  refreshLogExerciseCard(id, results);
}
