import { renderLogExerciseEditor } from "../components/WorkoutLogCard.js";
import { buildResultFromCells, formatLogText } from "../features/log/logExercises.js";

export function refreshLogExerciseCard(logId, results) {
  const text = document.querySelector(`[data-log-text="${logId}"]`);
  const editor = document.querySelector(`[data-log-editor="${logId}"]`);
  const list = editor?.querySelector(".log-exercise-list");

  if (text) text.textContent = formatLogText(results);
  if (list) {
    const template = document.createElement("template");
    template.innerHTML = renderLogExerciseEditor(logId, results).trim();
    list.replaceWith(template.content.firstElementChild);
  }
}

export function collectLogExerciseRows(logId) {
  const editor = document.querySelector(`[data-log-editor="${logId}"]`);
  if (!editor) return [];

  return [...editor.querySelectorAll(".log-exercise-row:not(.log-exercise-row-head)")].map((row) => {
    const name = row.querySelector('[data-field="name"]')?.value || "";
    const weight = row.querySelector('[data-field="weight"]')?.value || "";
    const repeats = row.querySelector('[data-field="repeats"]')?.value || "";
    const sets = row.querySelector('[data-field="sets"]')?.value || "1";
    return buildResultFromCells(name, weight, repeats, sets);
  }).filter((result) => result.name);
}
