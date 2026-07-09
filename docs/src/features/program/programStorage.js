const WORKOUTS_KEY = "slavikus:workouts";

const starterWorkouts = [
  {
    id: "workout-a",
    title: "Тренировка 1",
    shortName: "T1",
    exercises: [
      { name: "Разминка", target: "+", sets: 1 },
      { name: "Подтягивания", target: "12 x 3", sets: 3 },
      { name: "Пресс", target: "20 x 3", sets: 3 },
      { name: "Отжимания", target: "20 x 3", sets: 3 },
      { name: "Брусья", target: "20 x 3", sets: 3 },
      { name: "Гиперэкстензия", target: "25 x 3", sets: 3 },
      { name: "Штанга", target: "40кг x 13, 40кг x 12, 50кг x 7", sets: 3 },
      { name: "Заминка", target: "+", sets: 1 },
      { name: "Вис", target: "29 сек", sets: 1 }
    ]
  },
  {
    id: "workout-b",
    title: "Тренировка 2",
    shortName: "T2",
    exercises: [
      { name: "Разминка", target: "+", sets: 1 },
      { name: "Подъем на бицепс", target: "12кг x 12 x 3", sets: 3 },
      { name: "Гантели на бицепс", target: "20кг x 12 x 3", sets: 3 },
      { name: "Пресс", target: "20 x 4", sets: 4 },
      { name: "Заминка", target: "+", sets: 1 }
    ]
  },
  {
    id: "workout-c",
    title: "Тренировка 3",
    shortName: "T3",
    exercises: [
      { name: "Разминка", target: "+", sets: 1 },
      { name: "Становая со шрагами", target: "55кг x 11 x 3", sets: 3 },
      { name: "Гиперэкстензия", target: "25 x 3", sets: 3 },
      { name: "Вис", target: "29 сек", sets: 1 },
      { name: "Заминка", target: "+", sets: 1 }
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

  workout.exercises.push({
    name: "Новое упражнение",
    target: "10",
    weight: "",
    sets: 3
  });
  saveWorkouts(workouts);
}

export function updateExercise(workoutId, exerciseIndex, field, value) {
  const workouts = getWorkouts();
  const workout = workouts.find((item) => item.id === workoutId);
  const exercise = workout?.exercises[exerciseIndex];
  if (!exercise) return;

  if (field === "sets") {
    exercise.sets = Math.max(1, Number(value) || 1);
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
  return String(title).trim().replace(/^Т\d+\.\s*/i, "");
}
