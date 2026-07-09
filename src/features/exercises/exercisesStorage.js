const EXERCISES_KEY = "slavikus:exercise-catalog";
const EDIT_KEY = "slavikus:exercise-catalog-edit";

const defaultExercises = [
  "Гантели на бицепс",
  "Гиперэкстензия",
  "Вис",
  "Подтягивания",
  "Отжимания",
  "Разгиб ног сидя",
  "Подъем на бицепс бедра",
  "Подъем на носки",
  "Подъем штанги на бицепс",
  "Приседы",
  "Присед на станке",
  "Присед со штангой",
  "Разминка",
  "Становая тяга",
  "Становая тяга со шрагами",
  "Толкание платформы лежа",
  "Штанга на грудь",
  "Заминка",
  "Бег"
];

export function getExerciseCatalog() {
  seedExerciseCatalog();
  syncDefaultExercises();
  return sortExercises(JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]"));
}

export function addExerciseToCatalog(name) {
  const exercises = getExerciseCatalog();
  exercises.push({
    id: crypto.randomUUID(),
    name
  });
  saveExerciseCatalog(exercises);
}

export function renameExerciseInCatalog(id, name) {
  const exercises = getExerciseCatalog().map((exercise) => (
    exercise.id === id ? { ...exercise, name } : exercise
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

  saveExerciseCatalog(defaultExercises.map((name, index) => ({
    id: `base-exercise-${index + 1}`,
    name
  })));
}

function syncDefaultExercises() {
  const exercises = JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
  const existingNames = new Set(exercises.map((exercise) => normalizeName(exercise.name)));
  const missing = defaultExercises.filter((name) => !existingNames.has(normalizeName(name)));

  if (!missing.length) return;

  saveExerciseCatalog([
    ...exercises,
    ...missing.map((name) => ({
      id: `base-exercise-${crypto.randomUUID()}`,
      name
    }))
  ]);
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
