import { getCurrentUser } from "../features/profile/profileStorage.js";
import { PREMIUM_PRICE_RUB, getSubscriptionState } from "../features/profile/premiumSubscription.js";

export function renderProfileScreen() {
  const user = getCurrentUser();
  const subscription = getSubscriptionState(user);
  const premiumActive = subscription.plan === "Премиум";

  return `
    <section class="stack">
      <h1>Профиль</h1>
      <div class="profile-panel">
        <div class="avatar">${escapeHtml(user.name.slice(0, 1))}</div>
        <label>Имя<input value="${escapeAttr(user.name)}" readonly /></label>
        <label>Пол<input value="${escapeAttr(user.gender)}" readonly /></label>
        <button class="secondary-button" data-action="logout">Выйти</button>
      </div>

      <div class="subscription-panel">
        <div>
          <span>Подписка</span>
          <strong>${subscription.plan}</strong>
        </div>
        <p>${premiumActive ? renderPremiumText(subscription) : `Premium: ${PREMIUM_PRICE_RUB} ₽ в месяц. Промокод может снизить цену до 0 ₽.`}</p>
        <button class="primary-button" data-action="activatePremium">${premiumActive ? "Продлить Premium" : "Подключить Premium"}</button>
      </div>

      <div class="profile-panel">
        <h2>Лог тренировок</h2>
        <p>Удалить все сохраненные тренировки и демо-записи.</p>
        <button class="secondary-button" data-action="clearLog">Очистить лог</button>
      </div>
      <div class="profile-panel">
        <h2>Резервная копия</h2>
        <p>Сохрани тренировки, программу, календарь и профиль в файл или восстанови данные из файла.</p>
        <div class="backup-actions">
          <button class="secondary-button" data-action="exportBackup">Скачать копию</button>
          <button class="secondary-button" data-action="importBackup">Восстановить</button>
        </div>
      </div>
    </section>
  `;
}

function renderPremiumText(subscription) {
  const price = subscription.price ?? PREMIUM_PRICE_RUB;
  const payment = price === 0 ? "промокод, 0 ₽/мес" : `${price} ₽/мес`;
  return `Осталось дней: ${subscription.daysLeft}. Тариф: ${payment}.`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
