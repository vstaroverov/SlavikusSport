import { getCurrentUser } from "../features/profile/profileStorage.js";
import { getLastBackupLabel } from "../features/storage/backupFiles.js";

export function renderProfileScreen() {
  const user = getCurrentUser();

  return `
    <section class="stack">
      <h1>Профиль</h1>
      <div class="profile-panel">
        <div class="avatar">${escapeHtml(getAvatarLetter(user.name))}</div>
        <label>Логин<input value="${escapeAttr(user.name || "")}" maxlength="25" placeholder="Введите логин" data-profile-login /></label>
        <button class="secondary-button" data-action="saveProfileLogin">Сохранить логин</button>
        <button class="secondary-button" data-action="logout">Выйти</button>
      </div>

      <div class="profile-panel">
        <h2>Лог тренировок</h2>
        <p>Удалить все сохраненные тренировки и демо-записи.</p>
        <button class="secondary-button" data-action="clearLog">Очистить лог</button>
      </div>
      <div class="profile-panel">
        <h2>Резервная копия</h2>
        <p>Сохрани тренировки, программу, календарь и профиль в файл или восстанови данные из файла.</p>
        <p class="backup-date">Последняя копия: ${escapeHtml(getLastBackupLabel())}</p>
        <div class="backup-actions">
          <button class="secondary-button" data-action="exportBackup">Скачать копию</button>
          <button class="secondary-button" data-action="importBackup">Восстановить</button>
        </div>
      </div>

      <div class="profile-panel app-version-panel">
        <p>Версия: ${escapeHtml(getPlatformName())} - 0.016.2 от 13.07.2026</p>
        <p>Разработчик: V-STAR-GROUP.DIGITAL</p>
      </div>
    </section>
  `;
}

function getPlatformName() {
  const platform = window.Capacitor?.getPlatform?.();
  if (platform === "android") return "Android";
  return "Web";
}

function getAvatarLetter(value) {
  return String(value || "S").slice(0, 1).toLocaleUpperCase("ru-RU");
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
