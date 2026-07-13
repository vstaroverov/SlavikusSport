import { setCurrentUser } from "../features/profile/profileStorage.js";

export default function loginVk() {
  setCurrentUser({
    id: "vk-demo-user",
    name: "",
    gender: "",
    plan: "Обычная"
  });
  window.dispatchEvent(new CustomEvent("app:changed"));
}
