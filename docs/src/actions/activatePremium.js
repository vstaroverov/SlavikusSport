import {
  PREMIUM_PRICE_RUB,
  PREMIUM_PROMO_CODE,
  activatePremium,
  isFreePromoCode
} from "../features/profile/premiumSubscription.js";

export default async function activatePremiumAction() {
  const checkout = await showPremiumCheckout();
  if (!checkout) return;

  if (checkout.price === 0) {
    activatePremium({
      price: 0,
      promoCode: checkout.promoCode,
      paymentStatus: "promo"
    });
    window.dispatchEvent(new CustomEvent("app:changed"));
    return;
  }

  await showPaymentPlaceholder();
}

function showPremiumCheckout() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog premium-checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-checkout-title">
        <div class="confirm-mark">₽</div>
        <h2 id="premium-checkout-title">Premium подписка</h2>
        <div class="premium-price">
          <strong data-premium-price>${PREMIUM_PRICE_RUB} ₽</strong>
          <span>в месяц</span>
        </div>
        <p>Статистика, графики прогресса и рекомендации. Первый период: 30 дней.</p>
        <label>
          <span>Промокод</span>
          <input data-premium-promo placeholder="Введите промокод" autocomplete="off" />
          <small data-premium-promo-hint>Промокод для теста: ${PREMIUM_PROMO_CODE}</small>
        </label>
        <div class="confirm-actions">
          <button class="secondary-button" data-premium-cancel>Отмена</button>
          <button class="primary-button" data-premium-submit>Оплатить ${PREMIUM_PRICE_RUB} ₽</button>
        </div>
      </section>
    `;

    const priceLabel = overlay.querySelector("[data-premium-price]");
    const submitButton = overlay.querySelector("[data-premium-submit]");
    const promoInput = overlay.querySelector("[data-premium-promo]");
    const promoHint = overlay.querySelector("[data-premium-promo-hint]");

    const getCheckout = () => {
      const promoCode = promoInput.value.trim();
      const free = isFreePromoCode(promoCode);
      return {
        promoCode,
        price: free ? 0 : PREMIUM_PRICE_RUB
      };
    };

    const syncPrice = () => {
      const checkout = getCheckout();
      priceLabel.textContent = `${checkout.price} ₽`;
      submitButton.textContent = checkout.price === 0 ? "Оформить за 0 ₽" : `Оплатить ${PREMIUM_PRICE_RUB} ₽`;
      promoHint.textContent = checkout.price === 0 ? "Промокод применен. Цена 0 ₽." : `Промокод для теста: ${PREMIUM_PROMO_CODE}`;
      promoHint.classList.toggle("success", checkout.price === 0);
    };

    const close = (value) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const submit = () => close(getCheckout());
    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
      if (event.key === "Enter") submit();
    };

    promoInput.addEventListener("input", syncPrice);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-premium-cancel]").addEventListener("click", () => close(null));
    submitButton.addEventListener("click", submit);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    promoInput.focus();
  });
}

function showPaymentPlaceholder() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-placeholder-title">
        <div class="confirm-mark danger">!</div>
        <h2 id="payment-placeholder-title">Платежный шлюз не подключен</h2>
        <p>Для списания 650 ₽/мес нужен backend и эквайринг: ЮKassa, CloudPayments или другой провайдер. Тестовый промокод уже работает.</p>
        <div class="confirm-actions single">
          <button class="primary-button" data-payment-close>Понятно</button>
        </div>
      </section>
    `;

    const close = () => {
      overlay.remove();
      resolve();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector("[data-payment-close]").addEventListener("click", close);
    document.body.append(overlay);
  });
}
