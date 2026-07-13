import { getCurrentUser, setCurrentUser } from "../features/profile/profileStorage.js";

export default function saveProfileLogin(button) {
  const input = button.closest(".profile-panel")?.querySelector("[data-profile-login]");
  const user = getCurrentUser();
  if (!input || !user) return;

  const login = input.value.trim().slice(0, 25);
  input.value = login;
  setCurrentUser({ ...user, name: login });
  window.dispatchEvent(new CustomEvent("app:changed"));
}
