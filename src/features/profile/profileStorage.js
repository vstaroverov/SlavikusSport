const USER_KEY = "slavikus:user";

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || "null");
}

export function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}
