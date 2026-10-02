import { appStorage } from "../storage/persistentStorage.js";
const EXERCISES_KEY = "slavikus:exercise-catalog";
const EDIT_KEY = "slavikus:exercise-catalog-edit";
const COMPLETION_MIGRATION_KEY = "slavikus:exercise-completion-v2";
const ACTIVITY_MIGRATION_KEY = "slavikus:exercise-activity-v1";

export const exerciseCategories = {
  workout: { label: "Воркаут", mark: "WK" },
  crossfit: { label: "Кроссфит", mark: "CF" },
  strength: { label: "Силовая", mark: "СЛ" },
  base: { label: "База", mark: "БЗ" }
};

export const exerciseMeasures = {
  weighted: { label: "кг × повторы", shortLabel: "кг" },
  repeats: { label: "повторы", shortLabel: "повт." },
  distanceKm: { label: "километры и время", shortLabel: "км", planLabel: "км · время", planFields: ["distance", "time"] },
  distanceM: { label: "метры и время", shortLabel: "м", planLabel: "м · время", planFields: ["distance", "time"] },
  seconds: { label: "секунды", shortLabel: "сек." },
  completion: { label: "факт выполнения", shortLabel: "факт" }
};

const defaultExercises = [
  { name: "Бег", category: "workout", measure: "distanceKm" },
  { name: "Брусья", category: "workout", measure: "repeats" },
  { name: "Вис", category: "workout", measure: "seconds" },
  { name: "Гантели на бицепс", category: "strength", measure: "weighted" },
  { name: "Гиперэкстензия", category: "base", measure: "repeats" },
  { name: "Заплыв", category: "workout", measure: "distanceM" },
  { name: "Заминка", category: "base", measure: "completion" },
  { name: "Отжимания", category: "workout", measure: "repeats" },
  { name: "Подтягивания", category: "workout", measure: "repeats" },
  { name: "Подъем на бицепс бедра", category: "strength", measure: "weighted" },
  { name: "Подъем на носки", category: "strength", measure: "weighted" },
  { name: "Подъем штанги на бицепс", category: "strength", measure: "weighted" },
  { name: "Пресс", category: "workout", measure: "repeats" },
  { name: "Присед", category: "workout", measure: "repeats" },
  { name: "Присед в станке", category: "strength", measure: "weighted" },
  { name: "Присед со штангой", category: "base", measure: "weighted" },
  { name: "Приседы", category: "workout", measure: "repeats" },
  { name: "Разгиб ног сидя", category: "strength", measure: "weighted" },
  { name: "Разминка", category: "base", measure: "completion" },
  { name: "Становая со шрагами", category: "strength", measure: "weighted" },
  { name: "Становая тяга", category: "base", measure: "weighted" },
  { name: "Становая тяга со шрагами", category: "strength", measure: "weighted" },
  { name: "Толкание платформы лежа", category: "strength", measure: "weighted" },
  { name: "Штанга на бицепс", category: "strength", measure: "weighted" },
  { name: "Штанга на грудь", category: "crossfit", measure: "weighted" },
  { name: "Подтягивания с весом", category: "workout", measure: "weighted" },
  { name: "Отжимания с весом", category: "workout", measure: "weighted" },
  { name: "Брусья с весом", category: "workout", measure: "weighted" },
  { name: "Гиперэкстензия с весом", category: "base", measure: "weighted" }
];

const weightedVariantNames = new Map([
  ["подтягивания", "Подтягивания с весом"],
  ["отжимания", "Отжимания с весом"],
  ["брусья", "Брусья с весом"],
  ["гиперэкстензия", "Гиперэкстензия с весом"]
]);

export function getWeightedVariantName(name) {
  return weightedVariantNames.get(normalizeName(name)) || "";
}

export function hasAddedWeight(exercise) {
  const number = String(exercise?.weight || "").match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  return Number(number.replace(",", ".")) > 0;
}

export function getExerciseCatalog() {
  seedExerciseCatalog();
  normalizeStoredExercises();
  syncDefaultExercises();
  migrateCompletionExercise();
  migrateActivityExercises();
  return sortExercises(JSON.parse(appStorage.getItem(EXERCISES_KEY) || "[]"));
}

export function addExerciseToCatalog(name, category = "base", measure = "") {
  const exercises = getExerciseCatalog();
  exercises.push({
    id: crypto.randomUUID(),
    name,
    category: normalizeCategory(category),
    measure: normalizeMeasure(measure, name, category)
  });
  saveExerciseCatalog(exercises);
}

export function updateExerciseInCatalog(id, name, category = "base", measure = "") {
  const exercises = getExerciseCatalog().map((exercise) => (
    exercise.id === id
      ? { ...exercise, name, category: normalizeCategory(category), measure: normalizeMeasure(measure, name, category) }
      : exercise
  ));
  saveExerciseCatalog(exercises);
}

export function deleteExerciseFromCatalog(id) {
  const exercises = getExerciseCatalog().filter((exercise) => exercise.id !== id);
  saveExerciseCatalog(exercises);
}

export function getExerciseMeasure(exercise = {}) {
  return normalizeMeasure(exercise.measure, exercise.name, exercise.category);
}

export function isDistanceMeasure(measure) {
  return exerciseMeasures[measure]?.planFields?.includes("time") || false;
}

export function isExerciseCatalogEditMode() {
  return appStorage.getItem(EDIT_KEY) === "true";
}

export function toggleExerciseCatalogEditMode() {
  appStorage.setItem(EDIT_KEY, String(!isExerciseCatalogEditMode()));
}

function seedExerciseCatalog() {
  if (appStorage.getItem(EXERCISES_KEY)) return;

  saveExerciseCatalog(defaultExercises.map((exercise, index) => ({
    id: `base-exercise-${index + 1}`,
    ...exercise
  })));
}

function normalizeStoredExercises() {
  const raw = JSON.parse(appStorage.getItem(EXERCISES_KEY) || "[]");
  const normalized = raw.map((exercise, index) => {
    if (typeof exercise === "string") {
      return {
        id: `migrated-exercise-${index + 1}`,
        name: exercise,
        category: "base",
        measure: inferMeasure(exercise, "base")
      };
    }

    return {
      id: exercise.id || `migrated-exercise-${index + 1}`,
      name: exercise.name || "Упражнение",
      category: normalizeCategory(exercise.category),
      measure: normalizeMeasure(exercise.measure, exercise.name, exercise.category)
    };
  });

  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    saveExerciseCatalog(normalized);
  }
}

function migrateCompletionExercise() {
  if (appStorage.getItem(COMPLETION_MIGRATION_KEY)) return;
  const exercises = JSON.parse(appStorage.getItem(EXERCISES_KEY) || "[]");
  const updated = exercises.map((exercise) => ["разминка", "заминка"].includes(normalizeName(exercise.name))
    ? { ...exercise, measure: "completion" }
    : exercise);
  if (JSON.stringify(updated) !== JSON.stringify(exercises)) saveExerciseCatalog(updated);
  appStorage.setItem(COMPLETION_MIGRATION_KEY, "true");
}

function migrateActivityExercises() {
  if (appStorage.getItem(ACTIVITY_MIGRATION_KEY)) return;
  const exercises = JSON.parse(appStorage.getItem(EXERCISES_KEY) || "[]");
  const updated = exercises.map((exercise) => {
    const name = normalizeName(exercise.name);
    const measure = name === "бег" ? "distanceKm" : name === "заплыв" ? "distanceM" : "";
    return measure ? { ...exercise, measure } : exercise;
  });
  if (JSON.stringify(updated) !== JSON.stringify(exercises)) saveExerciseCatalog(updated);
  appStorage.setItem(ACTIVITY_MIGRATION_KEY, "true");
}

function syncDefaultExercises() {
  const exercises = JSON.parse(appStorage.getItem(EXERCISES_KEY) || "[]");
  const existingNames = new Set(exercises.map((exercise) => normalizeName(exercise.name)));
  const existingIds = new Set(exercises.map((exercise) => exercise.id));
  const missing = defaultExercises.filter((exercise, index) => (
    !existingNames.has(normalizeName(exercise.name)) && !existingIds.has(`base-exercise-${index + 1}`)
  ));

  if (!missing.length) return;

  saveExerciseCatalog([
    ...exercises,
    ...missing.map((exercise) => ({
      id: `base-exercise-${crypto.randomUUID()}`,
      ...exercise
    }))
  ]);
}

function saveExerciseCatalog(exercises) {
  appStorage.setItem(EXERCISES_KEY, JSON.stringify(sortExercises(exercises)));
}

function sortExercises(exercises) {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function normalizeName(name) {
  return String(name).trim().toLocaleLowerCase("ru-RU");
}

function normalizeCategory(category) {
  return exerciseCategories[category] ? category : "base";
}

function normalizeMeasure(measure, name = "", category = "base") {
  if (exerciseMeasures[measure]) return measure;
  return inferMeasure(name, category);
}

function inferMeasure(name, category = "base") {
  const text = normalizeName(name);
  if (text === "разминка" || text === "заминка") return "completion";
  if (text.endsWith(" с весом")) return "weighted";
  if (/бег/.test(text)) return "distanceKm";
  if (/заплыв|плав/.test(text)) return "distanceM";
  if (/вис|планк|сек/.test(text)) return "seconds";
  if (category === "strength") return "weighted";
  return "repeats";
}
