import { isDistanceMeasure } from "../exercises/exercisesStorage.js";
import { formatDurationForInput } from "../workout/durationInput.js";

export function formatPlannedTime(value) {
  return formatDurationForInput(value);
}

export function formatPlannedActivity(exercise) {
  if (!isDistanceMeasure(exercise?.measure)) return "";
  const distance = Number(String(exercise.target || "").replace(",", "."));
  const unit = exercise.measure === "distanceKm" ? "км" : "м";
  const distanceText = Number.isFinite(distance) && distance > 0
    ? `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 }).format(distance)} ${unit}`
    : "Расстояние не задано";
  const time = formatPlannedTime(exercise.time);
  return `${distanceText} · ${time || "Время не задано"}`;
}
