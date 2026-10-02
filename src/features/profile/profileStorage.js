import { appStorage } from "../storage/persistentStorage.js";
const USER_KEY = "slavikus:user";

export function getCurrentUser() {
  return JSON.parse(appStorage.getItem(USER_KEY) || "null");
}

export function setCurrentUser(user) {
  appStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  appStorage.removeItem(USER_KEY);
}
