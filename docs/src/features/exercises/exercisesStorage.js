const EXERCISES_KEY = "slavikus:exercise-catalog";
const EDIT_KEY = "slavikus:exercise-catalog-edit";

export const exerciseCategories = {
  workout: { label: "Воркаут", mark: "WK" },
  crossfit: { label: "Кроссфит", mark: "CF" },
  strength: { label: "Силовая", mark: "СЛ" },
  base: { label: "База", mark: "БЗ" }
};

export const exerciseMeasures = {
  weighted: { label: "кг × повторы", shortLabel: "кг" },
  repeats: { label: "повторы", shortLabel: "повт." },
  distanceKm: { label: "километры", shortLabel: "км" },
  distanceM: { label: "метры", shortLabel: "м" },
  seconds: { label: "секунды", shortLabel: "сек." }
};

const defaultExercises = [
  { name: "Бег", category: "workout", measure: "distanceKm" },
  { name: "Брусья", category: "workout", measure: "repeats" },
  { name: "Вис", category: "workout", measure: "seconds" },
  { name: "Гантели на бицепс", category: "strength", measure: "weighted" },
  { name: "Гиперэкстензия", category: "base", measure: "repeats" },
  { name: "Заплыв", category: "workout", measure: "distanceM" },
  { name: "Заминка", category: "base", measure: "seconds" },
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
  { name: "Разминка", category: "base", measure: "seconds" },
  { name: "Становая со шрагами", category: "strength", measure: "weighted" },
  { name: "Становая тяга", category: "base", measure: "weighted" },
  { name: "Становая тяга со шрагами", category: "strength", measure: "weighted" },
  { name: "Толкание платформы лежа", category: "strength", measure: "weighted" },
  { name: "Штанга на бицепс", category: "strength", measure: "weighted" },
  { name: "Штанга на грудь", category: "crossfit", measure: "weighted" }
];

export function getExerciseCatalog() {
  seedExerciseCatalog();
  normalizeStoredExercises();
  syncDefaultExercises();
  syncDefaultCategories();
  return sortExercises(JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]"));
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

export function isExerciseCatalogEditMode() {
  return localStorage.getItem(EDIT_KEY) === "true";
}

export function toggleExerciseCatalogEditMode() {
  localStorage.setItem(EDIT_KEY, String(!isExerciseCatalogEditMode()));
}

function seedExerciseCatalog() {
  if (localStorage.getItem(EXERCISES_KEY)) return;

  saveExerciseCatalog(defaultExercises.map((exercise, index) => ({
    id: `base-exercise-${index + 1}`,
    ...exercise
  })));
}

function normalizeStoredExercises() {
  const raw = JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
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

function syncDefaultExercises() {
  const exercises = JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
  const existingNames = new Set(exercises.map((exercise) => normalizeName(exercise.name)));
  const missing = defaultExercises.filter((exercise) => !existingNames.has(normalizeName(exercise.name)));

  if (!missing.length) return;

  saveExerciseCatalog([
    ...exercises,
    ...missing.map((exercise) => ({
      id: `base-exercise-${crypto.randomUUID()}`,
      ...exercise
    }))
  ]);
}

function syncDefaultCategories() {
  const defaultsByName = new Map(defaultExercises.map((exercise) => [
    normalizeName(exercise.name),
    exercise
  ]));
  const exercises = JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
  let changed = false;

  const synced = exercises.map((exercise) => {
    const defaultExercise = defaultsByName.get(normalizeName(exercise.name));
    if (!defaultExercise) return exercise;

    const category = exercise.category === defaultExercise.category ? exercise.category : defaultExercise.category;
    const measure = exerciseMeasures[exercise.measure] ? exercise.measure : defaultExercise.measure;
    if (category === exercise.category && measure === exercise.measure) return exercise;

    changed = true;
    return { ...exercise, category, measure };
  });

  if (changed) saveExerciseCatalog(synced);
}

function saveExerciseCatalog(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(sortExercises(exercises)));
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
  if (/бег/.test(text)) return "distanceKm";
  if (/заплыв|плав/.test(text)) return "distanceM";
  if (/вис|планк|сек|разминк|заминк/.test(text)) return "seconds";
  if (category === "strength") return "weighted";
  return "repeats";
}
