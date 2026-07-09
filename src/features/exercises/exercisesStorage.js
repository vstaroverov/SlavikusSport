const EXERCISES_KEY = "slavikus:exercise-catalog";
const EDIT_KEY = "slavikus:exercise-catalog-edit";

export const exerciseCategories = {
  workout: { label: "Воркаут", mark: "WK" },
  crossfit: { label: "Кроссфит", mark: "CF" },
  strength: { label: "Силовая", mark: "СЛ" },
  base: { label: "База", mark: "БЗ" }
};

const defaultExercises = [
  { name: "Бег", category: "workout" },
  { name: "Брусья", category: "workout" },
  { name: "Вис", category: "workout" },
  { name: "Гантели на бицепс", category: "strength" },
  { name: "Гиперэкстензия", category: "base" },
  { name: "Заплыв", category: "workout" },
  { name: "Заминка", category: "base" },
  { name: "Отжимания", category: "workout" },
  { name: "Подтягивания", category: "workout" },
  { name: "Подъем на бицепс бедра", category: "strength" },
  { name: "Подъем на носки", category: "strength" },
  { name: "Подъем штанги на бицепс", category: "strength" },
  { name: "Пресс", category: "workout" },
  { name: "Присед", category: "workout" },
  { name: "Присед в станке", category: "strength" },
  { name: "Присед со штангой", category: "base" },
  { name: "Приседы", category: "workout" },
  { name: "Разгиб ног сидя", category: "strength" },
  { name: "Разминка", category: "base" },
  { name: "Становая со шрагами", category: "strength" },
  { name: "Становая тяга", category: "base" },
  { name: "Становая тяга со шрагами", category: "strength" },
  { name: "Толкание платформы лежа", category: "strength" },
  { name: "Штанга на бицепс", category: "strength" },
  { name: "Штанга на грудь", category: "crossfit" }
];

export function getExerciseCatalog() {
  seedExerciseCatalog();
  normalizeStoredExercises();
  syncDefaultExercises();
  syncDefaultCategories();
  return sortExercises(JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]"));
}

export function addExerciseToCatalog(name, category = "base") {
  const exercises = getExerciseCatalog();
  exercises.push({
    id: crypto.randomUUID(),
    name,
    category: normalizeCategory(category)
  });
  saveExerciseCatalog(exercises);
}

export function updateExerciseInCatalog(id, name, category = "base") {
  const exercises = getExerciseCatalog().map((exercise) => (
    exercise.id === id
      ? { ...exercise, name, category: normalizeCategory(category) }
      : exercise
  ));
  saveExerciseCatalog(exercises);
}

export function deleteExerciseFromCatalog(id) {
  const exercises = getExerciseCatalog().filter((exercise) => exercise.id !== id);
  saveExerciseCatalog(exercises);
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
        category: "base"
      };
    }

    return {
      id: exercise.id || `migrated-exercise-${index + 1}`,
      name: exercise.name || "Упражнение",
      category: normalizeCategory(exercise.category)
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
  const categoryByName = new Map(defaultExercises.map((exercise) => [
    normalizeName(exercise.name),
    exercise.category
  ]));
  const exercises = JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
  let changed = false;

  const synced = exercises.map((exercise) => {
    const category = categoryByName.get(normalizeName(exercise.name));
    if (!category || exercise.category === category) return exercise;

    changed = true;
    return { ...exercise, category };
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
  return String(name).trim().toLowerCase();
}

function normalizeCategory(category) {
  return exerciseCategories[category] ? category : "base";
}
