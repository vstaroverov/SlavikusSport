import { clearCurrentUser } from "../features/profile/profileStorage.js";

export default function logout() {
  clearCurrentUser();
  window.location.hash = "";
  window.dispatchEvent(new CustomEvent("app:changed"));
}
