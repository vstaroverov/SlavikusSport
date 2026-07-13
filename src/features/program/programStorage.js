import { getExerciseCatalog } from "../exercises/exercisesStorage.js";

const WORKOUTS_KEY = "slavikus:workouts";
const WORKOUTS_VERSION_KEY = "slavikus:workouts-version";
const WORKOUTS_VERSION = "2026-07-default-program-3";

const starterWorkouts = [
  {
    id: "workout-full-body",
    title: "Фулл бади",
    shortName: "Т1",
    exercises: [
      exercise("Разминка", "1", "0", 1),
      exercise("Подтягивания", "15", "0", 1),
      exercise("Отжимания", "20", "0", 1),
      exercise("Брусья", "20", "0", 1),
      exercise("Гиперэкстензия", "25", "0", 1),
      exercise("Присед", "25", "0", 1),
      exercise("Штанга на грудь", "15", "50", 3),
      exercise("Пресс", "25", "0", 1),
      exercise("Штанга на бицепс", "15", "25", 3),
      exercise("Пресс", "25", "0", 1),
      exercise("Гантели на бицепс", "14", "14", 3),
      exercise("Пресс", "25", "0", 1),
      exercise("Становая со шрагами", "15", "60", 3),
      exercise("Пресс", "25", "0", 1),
      exercise("Заминка", "1", "0", 1),
      exercise("Вис", "1", "29 секунд", 1)
    ]
  },
  {
    id: "workout-leg-day",
    title: "День ног",
    shortName: "Т2",
    exercises: [
      exercise("Разминка", "1", "0", 1),
      exercise("Подтягивания", "15", "0", 1),
      exercise("Отжимания", "25", "0", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Брусья", "20", "0", 1),
      exercise("Гиперэкстензия", "25", "0", 1),
      exercise("Приседы", "25", "0", 1),
      exercise("Разгиб ног сидя", "20", "61", 1),
      exercise("Подъем на бицепс бедра", "15", "45", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Разгиб ног сидя", "20", "61", 1),
      exercise("Подъем на бицепс бедра", "15", "45", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Разгиб ног сидя", "20", "61", 1),
      exercise("Подъем на бицепс бедра", "15", "45", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Толкание платформы лежа", "15", "200", 1),
      exercise("Присед в станке", "15", "65", 1),
      exercise("Присед со штангой", "15", "40", 1),
      exercise("Подъем на носки", "15", "65", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Толкание платформы лежа", "15", "200", 1),
      exercise("Присед в станке", "15", "65", 1),
      exercise("Присед со штангой", "15", "40", 1),
      exercise("Подъем на носки", "15", "65", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Толкание платформы лежа", "15", "200", 1),
      exercise("Присед в станке", "15", "65", 1),
      exercise("Присед со штангой", "15", "40", 1),
      exercise("Подъем на носки", "15", "65", 1),
      exercise("Пресс", "25", "0", 1),
      exercise("Заминка", "1", "0", 1),
      exercise("Вис", "1", "29 секунд", 1)
    ]
  },
  {
    id: "workout-pool",
    title: "Бассейн",
    shortName: "Т3",
    exercises: [
      exercise("Заплыв", "1", "45 минут", 1)
    ]
  },
  {
    id: "workout-run",
    title: "Пробежка",
    shortName: "Т4",
    exercises: [
      exercise("Бег", "1", "45 минут", 1)
    ]
  }
];

export function seedInitialData() {
  if (
    !localStorage.getItem(WORKOUTS_KEY)
    || localStorage.getItem(WORKOUTS_VERSION_KEY) !== WORKOUTS_VERSION
  ) {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(starterWorkouts));
    localStorage.setItem(WORKOUTS_VERSION_KEY, WORKOUTS_VERSION);
  }
}

export function getWorkouts() {
  return JSON.parse(localStorage.getItem(WORKOUTS_KEY) || "[]");
}

export function saveWorkouts(workouts) {
  const numberedWorkouts = workouts.map((workout, index) => ({
    ...workout,
    shortName: `Т${index + 1}`
  }));
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(numberedWorkouts));
}

export function getWorkout(id) {
  return getWorkouts().find((workout) => workout.id === id);
}

export function renameWorkout(id, title) {
  const workouts = getWorkouts().map((workout) => {
    if (workout.id !== id) return workout;
    return { ...workout, title: stripWorkoutPrefix(title) };
  });
  saveWorkouts(workouts);
}

export function deleteWorkout(id) {
  const workouts = getWorkouts().filter((workout) => workout.id !== id);
  saveWorkouts(workouts);
}

export function moveWorkout(id, direction) {
  const workouts = getWorkouts();
  const index = workouts.findIndex((workout) => workout.id === id);
  const nextIndex = index + direction;

  if (index < 0 || nextIndex < 0 || nextIndex >= workouts.length) {
    return;
  }

  const [workout] = workouts.splice(index, 1);
  workouts.splice(nextIndex, 0, workout);
  saveWorkouts(workouts);
}

export function addExercise(workoutId) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  const catalogExercise = getExerciseCatalog()[0];
  workout.exercises.push({
    name: catalogExercise?.name || "Упражнение",
    target: "",
    weight: "",
    sets: ""
  });
  saveWorkouts(workouts);
}

export function updateExercise(workoutId, exerciseIndex, field, value) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  const exerciseItem = workout?.exercises[exerciseIndex];
  if (!exerciseItem) return;

  if (field === "sets") {
    exerciseItem.sets = value === "" ? "" : Math.max(1, Number(value) || 1);
  } else if (field === "weight") {
    exerciseItem.weight = value.trim();
  } else {
    exerciseItem[field] = value.trim() || (field === "name" ? "Упражнение" : "");
  }

  saveWorkouts(workouts);
}

export function deleteExercise(workoutId, exerciseIndex) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout || workout.exercises.length <= 1) return false;

  workout.exercises.splice(exerciseIndex, 1);
  saveWorkouts(workouts);
  return true;
}

export function moveExercise(workoutId, exerciseIndex, direction) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) return;

  const nextIndex = exerciseIndex + direction;
  if (exerciseIndex < 0 || nextIndex < 0 || nextIndex >= workout.exercises.length) {
    return;
  }

  const [exerciseItem] = workout.exercises.splice(exerciseIndex, 1);
  workout.exercises.splice(nextIndex, 0, exerciseItem);
  saveWorkouts(workouts);
}

function exercise(name, target, weight, sets) {
  return { name, target, weight, sets };
}

function stripWorkoutPrefix(title) {
  return String(title).trim().replace(/^Т\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}
