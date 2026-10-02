import { isDistanceMeasure } from "../exercises/exercisesStorage.js";

export function formatPlannedTime(value) {
  const text = String(value || "").trim();
  if (!/^\d+:[0-5]\d$/.test(text)) return "";
  const [minutes, seconds] = text.split(":").map(Number);
  if (minutes === 0 && seconds === 0) return "";
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatPlannedActivity(exercise) {
  if (!isDistanceMeasure(exercise?.measure)) return "";
  const distance = Number(String(exercise.target || "").replace(",", "."));
  const unit = exercise.measure === "distanceKm" ? "км" : "м";
  const distanceText = Number.isFinite(distance) && distance > 0
    ? `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 }).format(distance)} ${unit}`
    : "Расстояние не задано";
  const time = formatPlannedTime(exercise.time);
  return `${distanceText} · ${time ? `${time} мин` : "Время не задано"}`;
}
