import { getCurrentUser, setCurrentUser } from "./profileStorage.js";

export const PREMIUM_DAYS = 30;
export const PREMIUM_PRICE_RUB = 650;
export const PREMIUM_PROMO_CODE = "KolinMagTor";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getSubscriptionState(user = getCurrentUser()) {
  if (!user) return { plan: "Обычная", daysLeft: 0, premiumUntil: null, price: PREMIUM_PRICE_RUB };

  const premiumUntil = user.premiumUntil || null;
  const daysLeft = getPremiumDaysLeft(premiumUntil);

  if (user.plan === "Премиум" && daysLeft <= 0) {
    setCurrentUser({ ...user, plan: "Обычная", premiumUntil: null });
    return { plan: "Обычная", daysLeft: 0, premiumUntil: null, price: PREMIUM_PRICE_RUB };
  }

  return {
    plan: daysLeft > 0 ? "Премиум" : "Обычная",
    daysLeft,
    premiumUntil,
    price: user.premiumPrice ?? PREMIUM_PRICE_RUB,
    promoCode: user.premiumPromoCode || "",
    paymentStatus: user.premiumPaymentStatus || null
  };
}

export function activatePremium({ price = PREMIUM_PRICE_RUB, promoCode = "", paymentStatus = "paid" } = {}) {
  const user = getCurrentUser();
  if (!user) return;

  const premiumUntil = new Date(Date.now() + PREMIUM_DAYS * DAY_MS).toISOString();
  setCurrentUser({
    ...user,
    plan: "Премиум",
    premiumUntil,
    premiumActivatedAt: new Date().toISOString(),
    premiumPrice: price,
    premiumPromoCode: promoCode,
    premiumPaymentStatus: paymentStatus,
    premiumPeriod: "month"
  });
}

export function isFreePromoCode(value) {
  return String(value || "").trim().toLowerCase() === PREMIUM_PROMO_CODE.toLowerCase();
}

export function getPremiumDaysLeft(premiumUntil) {
  if (!premiumUntil) return 0;
  const diff = new Date(premiumUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}
