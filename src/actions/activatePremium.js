import { activatePremium } from "../features/profile/premiumSubscription.js";

export default function activatePremiumAction() {
  activatePremium();
  window.dispatchEvent(new CustomEvent("app:changed"));
}
