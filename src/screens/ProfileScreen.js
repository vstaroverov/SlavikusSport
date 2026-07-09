import { getCurrentUser } from "../features/profile/profileStorage.js";
import { getSubscriptionState } from "../features/profile/premiumSubscription.js";

export function renderProfileScreen() {
  const user = getCurrentUser();
  const subscription = getSubscriptionState(user);

  return `
    <section class="stack">
      <h1>Профиль</h1>
      <div class="profile-panel">
        <div class="avatar">${user.name.slice(0, 1)}</div>
        <label>Имя<input value="${user.name}" readonly /></label>
        <label>Пол<input value="${user.gender}" readonly /></label>
        <button class="secondary-button" data-action="logout">Выйти</button>
      </div>

      <div class="subscription-panel">
        <div>
          <span>Подписка</span>
          <strong>${subscription.plan}</strong>
        </div>
        <p>${subscription.plan === "Премиум" ? `Осталось дней: ${subscription.daysLeft}` : "Premium доступен на 30 дней."}</p>
        <button class="primary-button" data-action="activatePremium">Подключить Premium</button>
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
