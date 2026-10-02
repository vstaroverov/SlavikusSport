import { renderLogExerciseEditor } from "../components/WorkoutLogCard.js";
import { buildResultFromCells, formatLogText, isRunMeterInput } from "../features/log/logExercises.js";
import { getExerciseCatalog, getExerciseMeasure } from "../features/exercises/exercisesStorage.js";

export function createLogExerciseDraft(name, fallbackMeasure = "repeats") {
  const catalogExercise = getExerciseCatalog().find((exercise) => exercise.name === name);
  return {
    name,
    measure: catalogExercise ? getExerciseMeasure(catalogExercise) : fallbackMeasure,
    target: "",
    weight: "",
    weights: [],
    times: [],
    routes: [],
    sets: 1,
    done: []
  };
}

export function refreshLogExerciseCard(logId, results) {
  const text = document.querySelector(`[data-log-text="${logId}"]`);
  const editor = document.querySelector(`[data-log-editor="${logId}"]`);
  const list = editor?.querySelector(".vsg-sport-log-edit-list");

  if (text) text.textContent = formatLogText(results);
  if (list) {
    const template = document.createElement("template");
    template.innerHTML = renderLogExerciseEditor(logId, results).trim();
    list.replaceWith(template.content.firstElementChild);
  }
}

export function collectLogExerciseRows(logId, currentResults = []) {
  const editor = document.querySelector(`[data-log-editor="${logId}"]`);
  if (!editor) return [];

  return [...editor.querySelectorAll(".vsg-sport-log-edit-row")].map((row, index) => {
    const name = row.querySelector('[data-field="name"]')?.value || "";
    const measure = row.dataset.measure || currentResults[index]?.measure || "repeats";
    if (measure === "completion") {
      const completed = row.querySelector('[data-field="completed"]')?.checked;
      return { name, measure, target: "", weight: "", weights: completed ? [""] : [], done: completed ? ["1"] : [], sets: 1 };
    }
    if (measure === "distanceKm" || measure === "distanceM") {
      const distance = row.querySelector('[data-field="distance"]')?.value || "";
      const time = row.querySelector('[data-field="time"]')?.value || "";
      const parts = time.split(":").map(Number);
      const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : Number(time) || 0;
      const sets = 1;
      const hasDistance = Number(String(distance).replace(",", ".")) > 0;
      const storedDistance = hasDistance && isRunMeterInput({ name, measure })
        ? String(Number(String(distance).replace(",", ".")) / 1000)
        : distance;
      return {
        name, measure, target: hasDistance ? storedDistance : "", weight: "", weights: hasDistance ? Array(sets).fill("") : [],
        done: hasDistance ? Array(sets).fill(storedDistance) : [], times: hasDistance ? Array(sets).fill(seconds) : [], sets,
        routes: currentResults[index]?.routes || []
      };
    }
    const weight = row.querySelector('[data-field="weight"]')?.value || "";
    const repeats = row.querySelector('[data-field="repeats"]')?.value || "";
    const sets = row.querySelector('[data-field="sets"]')?.value || "1";
    if (!(String(repeats).match(/\d+(?:[.,]\d+)?/g) || []).some((value) => Number(value.replace(",", ".")) > 0)) {
      return { name, measure, target: "", weight: "", weights: [], done: [], sets: Math.max(1, Number(sets) || 1) };
    }
    return { ...buildResultFromCells(name, weight, repeats, sets), measure };
  }).filter((result) => result.name);
}
