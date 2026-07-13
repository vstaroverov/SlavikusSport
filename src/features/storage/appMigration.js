import { setCurrentUser } from "../profile/profileStorage.js";

const RESET_KEY = "slavikus:reset-0.016.2";
const EMPTY_WORKOUTS_VERSION = "2026-07-empty-program-1";

export function applyAppMigration(user) {
  if (!user || localStorage.getItem(RESET_KEY)) return user;

  const nextUser = {
    ...user,
    name: "",
    gender: ""
  };

  resetWorkoutData(user.id);
  localStorage.setItem(RESET_KEY, "true");
  setCurrentUser(nextUser);

  return nextUser;
}

export function resetWorkoutData(userId = "guest") {
  const encodedUserId = encodeURIComponent(userId || "guest");

  localStorage.setItem(`slavikus:log:${encodedUserId}`, JSON.stringify([]));
  localStorage.setItem(`slavikus:calendar:${encodedUserId}`, JSON.stringify({}));
  localStorage.setItem("slavikus:log", JSON.stringify([]));
  localStorage.setItem("slavikus:calendar", JSON.stringify({}));
  localStorage.removeItem("slavikus:active-workout");
  localStorage.removeItem("slavikus:program-active-workout");
  localStorage.setItem("slavikus:program-edit", "false");
  localStorage.setItem("slavikus:workouts", JSON.stringify([]));
  localStorage.setItem("slavikus:workouts-version", EMPTY_WORKOUTS_VERSION);
}
