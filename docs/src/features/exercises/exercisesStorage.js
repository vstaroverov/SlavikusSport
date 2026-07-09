const EXERCISES_KEY = "slavikus:exercise-catalog";
const EDIT_KEY = "slavikus:exercise-catalog-edit";

const defaultExercises = [
  "Подтягивания",
  "Отжимания",
  "Приседы",
  "Разминка",
  "Заминка",
  "Бег"
];

export function getExerciseCatalog() {
  seedExerciseCatalog();
  return JSON.parse(localStorage.getItem(EXERCISES_KEY) || "[]");
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

function saveExerciseCatalog(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}
