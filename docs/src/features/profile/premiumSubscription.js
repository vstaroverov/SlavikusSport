import { getCurrentUser, setCurrentUser } from "./profileStorage.js";

const PREMIUM_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Future premium purchase flow:
// 1. User buys Premium for 30 days for a configured price.
// 2. Payment provider confirms successful payment.
// 3. App stores premiumUntil = purchase date + 30 days.
// 4. Every day the remaining counter decreases by one day.
// 5. When premiumUntil expires, subscription status becomes ordinary again.

export function getSubscriptionState(user = getCurrentUser()) {
  if (!user) return { plan: "Обычная", daysLeft: 0, premiumUntil: null };

  const premiumUntil = user.premiumUntil || null;
  const daysLeft = getPremiumDaysLeft(premiumUntil);

  if (user.plan === "Премиум" && daysLeft <= 0) {
    setCurrentUser({ ...user, plan: "Обычная", premiumUntil: null });
    return { plan: "Обычная", daysLeft: 0, premiumUntil: null };
  }

  return {
    plan: daysLeft > 0 ? "Премиум" : "Обычная",
    daysLeft,
    premiumUntil
  };
}

export function activatePremium() {
  const user = getCurrentUser();
  if (!user) return;

  const premiumUntil = new Date(Date.now() + PREMIUM_DAYS * DAY_MS).toISOString();
  setCurrentUser({
    ...user,
    plan: "Премиум",
    premiumUntil
  });
}

export function getPremiumDaysLeft(premiumUntil) {
  if (!premiumUntil) return 0;
  const diff = new Date(premiumUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}
