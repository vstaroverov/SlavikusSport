import { appStorage } from "./persistentStorage.js";
import { setCurrentUser } from "../profile/profileStorage.js";

const RESET_KEY = "slavikus:reset-0.016.2";
const EMPTY_WORKOUTS_VERSION = "2026-07-empty-program-1";

export function applyAppMigration(user) {
  if (!user || appStorage.getItem(RESET_KEY)) return user;

  const nextUser = {
    ...user,
    name: "",
    gender: ""
  };

  resetWorkoutData(user.id);
  appStorage.setItem(RESET_KEY, "true");
  setCurrentUser(nextUser);

  return nextUser;
}

export function resetWorkoutData(userId = "guest") {
  const encodedUserId = encodeURIComponent(userId || "guest");

  appStorage.setItem(`slavikus:log:${encodedUserId}`, JSON.stringify([]));
  appStorage.setItem(`slavikus:calendar:${encodedUserId}`, JSON.stringify({}));
  appStorage.setItem("slavikus:log", JSON.stringify([]));
  appStorage.setItem("slavikus:calendar", JSON.stringify({}));
  appStorage.removeItem("slavikus:active-workout");
  appStorage.removeItem("slavikus:program-active-workout");
  appStorage.setItem("slavikus:program-edit", "false");
  appStorage.setItem("slavikus:workouts", JSON.stringify([]));
  appStorage.setItem("slavikus:workouts-version", EMPTY_WORKOUTS_VERSION);
}
