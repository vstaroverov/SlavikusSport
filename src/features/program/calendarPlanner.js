import { getCurrentUser } from "../profile/profileStorage.js";

const LEGACY_PLAN_KEY = "slavikus:calendar";
const PLAN_KEY_PREFIX = "slavikus:calendar:";
const MIGRATION_KEY_PREFIX = "slavikus:calendar-migrated:";

export function getPlan() {
  migrateLegacyPlan();
  return JSON.parse(localStorage.getItem(getPlanKey()) || "{}");
}

export function getPlannedWorkoutId(date = todayIso(), withFallback = true) {
  return getPlan()[date] || (withFallback ? "workout-a" : null);
}

export function setPlannedWorkout(date, workoutId) {
  const plan = getPlan();
  plan[date] = workoutId;
  savePlan(plan);
}

export function clearPlannedWorkout(date) {
  const plan = getPlan();
  delete plan[date];
  savePlan(plan);
}

export function removeWorkoutFromPlan(workoutId) {
  const plan = getPlan();
  Object.entries(plan).forEach(([date, id]) => {
    if (id === workoutId) delete plan[date];
  });
  savePlan(plan);
}

function savePlan(plan) {
  localStorage.setItem(getPlanKey(), JSON.stringify(plan));
}

function getPlanKey() {
  const user = getCurrentUser();
  return `${PLAN_KEY_PREFIX}${encodeURIComponent(user?.id || "guest")}`;
}

function getMigrationKey() {
  const user = getCurrentUser();
  return `${MIGRATION_KEY_PREFIX}${encodeURIComponent(user?.id || "guest")}`;
}

function migrateLegacyPlan() {
  const migrationKey = getMigrationKey();
  if (localStorage.getItem(migrationKey)) return;

  const legacyPlan = JSON.parse(localStorage.getItem(LEGACY_PLAN_KEY) || "{}");
  const planKey = getPlanKey();
  const currentPlan = JSON.parse(localStorage.getItem(planKey) || "{}");

  if (Object.keys(legacyPlan).length && !Object.keys(currentPlan).length) {
    localStorage.setItem(planKey, JSON.stringify(legacyPlan));
  }

  localStorage.setItem(migrationKey, "true");
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
