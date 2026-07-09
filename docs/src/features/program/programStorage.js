import { getExerciseCatalog } from "../exercises/exercisesStorage.js";

const WORKOUTS_KEY = "slavikus:workouts";

const starterWorkouts = [
  {
    id: "workout-a",
    title: "Тренировка 1",
    shortName: "Т1",
    exercises: [
      { name: "Разминка", target: "+", weight: "", sets: 1 },
      { name: "Подтягивания", target: "12 x 3", weight: "", sets: 3 },
      { name: "Отжимания", target: "20 x 3", weight: "", sets: 3 },
      { name: "Гиперэкстензия", target: "25 x 3", weight: "", sets: 3 },
      { name: "Заминка", target: "+", weight: "", sets: 1 },
      { name: "Вис", target: "29 сек", weight: "", sets: 1 }
    ]
  },
  {
    id: "workout-b",
    title: "Тренировка 2",
    shortName: "Т2",
    exercises: [
      { name: "Разминка", target: "+", weight: "", sets: 1 },
      { name: "Подъем штанги на бицепс", target: "12 x 3", weight: "12", sets: 3 },
      { name: "Гантели на бицепс", target: "12 x 3", weight: "20", sets: 3 },
      { name: "Приседы", target: "20 x 4", weight: "", sets: 4 },
      { name: "Заминка", target: "+", weight: "", sets: 1 }
    ]
  },
  {
    id: "workout-c",
    title: "Тренировка 3",
    shortName: "Т3",
    exercises: [
      { name: "Разминка", target: "+", weight: "", sets: 1 },
      { name: "Становая тяга со шрагами", target: "11 x 3", weight: "55", sets: 3 },
      { name: "Гиперэкстензия", target: "25 x 3", weight: "", sets: 3 },
      { name: "Вис", target: "29 сек", weight: "", sets: 1 },
      { name: "Заминка", target: "+", weight: "", sets: 1 }
    ]
  }
];

export function seedInitialData() {
  if (!localStorage.getItem(WORKOUTS_KEY)) {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(starterWorkouts));
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
  const exercise = workout?.exercises[exerciseIndex];
  if (!exercise) return;

  if (field === "sets") {
    exercise.sets = value === "" ? "" : Math.max(1, Number(value) || 1);
  } else if (field === "weight") {
    exercise.weight = value.trim();
  } else {
    exercise[field] = value.trim() || (field === "name" ? "Упражнение" : "+");
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

  const [exercise] = workout.exercises.splice(exerciseIndex, 1);
  workout.exercises.splice(nextIndex, 0, exercise);
  saveWorkouts(workouts);
}

function stripWorkoutPrefix(title) {
  return String(title).trim().replace(/^Т\d+\.\s*/i, "").replace(/^Ğ¢\d+\.\s*/i, "");
}
