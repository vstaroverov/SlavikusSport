const PLAN_KEY = "slavikus:calendar";

export function getPlan() {
  return JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
}

export function getPlannedWorkoutId(date = todayIso(), withFallback = true) {
  return getPlan()[date] || (withFallback ? "workout-a" : null);
}

export function setPlannedWorkout(date, workoutId) {
  const plan = getPlan();
  plan[date] = workoutId;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function clearPlannedWorkout(date) {
  const plan = getPlan();
  delete plan[date];
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function removeWorkoutFromPlan(workoutId) {
  const plan = getPlan();
  Object.entries(plan).forEach(([date, id]) => {
    if (id === workoutId) delete plan[date];
  });
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function todayIso() {
  return dateToIso(new Date());
}

export function dateToIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
