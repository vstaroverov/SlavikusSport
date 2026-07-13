import { setCurrentUser } from "../profile/profileStorage.js";

const RESET_KEY = "slavikus:reset-0.016.2";

export function applyAppMigration(user) {
  if (!user || localStorage.getItem(RESET_KEY)) return user;

  const nextUser = {
    ...user,
    name: "",
    gender: ""
  };

  localStorage.setItem(`slavikus:log:${encodeURIComponent(user.id || "guest")}`, JSON.stringify([]));
  localStorage.setItem(`slavikus:calendar:${encodeURIComponent(user.id || "guest")}`, JSON.stringify({}));
  localStorage.setItem("slavikus:log", JSON.stringify([]));
  localStorage.setItem("slavikus:calendar", JSON.stringify({}));
  localStorage.removeItem("slavikus:active-workout");
  localStorage.setItem("slavikus:workouts", JSON.stringify([]));
  localStorage.setItem("slavikus:workouts-version", "2026-07-empty-program-1");
  localStorage.setItem(RESET_KEY, "true");
  setCurrentUser(nextUser);

  return nextUser;
}
