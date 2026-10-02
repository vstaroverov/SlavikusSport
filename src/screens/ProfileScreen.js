import { getCurrentUser } from "../features/profile/profileStorage.js";
import { getBackupFreshness, getLastBackupLabel } from "../features/storage/backupFiles.js";

export function renderProfileScreen() {
  const user = getCurrentUser();
  const backup = getBackupFreshness();
  const name = user?.name || "";

  return `
    <section class="vsg vsg-sport-profile-screen">
      <header class="vsg-sport-profile-heading"><span class="vsg-eyebrow">Настройки и данные</span><h1>Профиль</h1><p>Управление именем, копией данных и приложением.</p></header>
      <article class="vsg-card vsg-sport-profile-card vsg-sport-profile-identity">
        <div class="vsg-sport-profile-person"><span class="vsg-sport-profile-avatar" aria-hidden="true">${escapeHtml(getAvatarLetter(name))}</span><div><span class="vsg-eyebrow">Спортсмен</span><h2>Мой профиль</h2></div></div>
        <label class="vsg-field">Логин<input class="vsg-input" value="${escapeAttr(name)}" maxlength="25" placeholder="Введите логин" data-profile-login data-change="saveProfileLogin" /></label>
        <button class="vsg-button vsg-button--primary" type="button" data-action="saveProfileLogin">Сохранить логин</button>
      </article>
      <article class="vsg-card vsg-sport-profile-card">
        <div class="vsg-sport-profile-card-head"><div><span class="vsg-eyebrow">Данные</span><h2>Резервная копия</h2></div><span class="vsg-badge ${backup.isFresh ? "vsg-badge--success" : "vsg-badge--warning"}">${escapeHtml(backup.label)}</span></div>
        <p>Сохрани программу, календарь, историю и профиль в JSON-файл.</p>
        <div class="vsg-sport-profile-backup-meta"><span>Последняя копия</span><strong>${escapeHtml(getLastBackupLabel())}</strong></div>
        <div class="vsg-sport-profile-actions"><button class="vsg-button vsg-button--primary" type="button" data-action="exportBackup">Скачать копию</button><button class="vsg-button" type="button" data-action="checkBackup">Проверить копию</button><button class="vsg-button" type="button" data-action="importBackup">Восстановить</button></div>
      </article>
      <article class="vsg-card vsg-sport-profile-card">
        <div class="vsg-sport-profile-card-head"><div><span class="vsg-eyebrow">История</span><h2>Лог тренировок</h2></div></div>
        <p>Все записи текущего пользователя будут удалены. Это действие нельзя отменить.</p>
        <button class="vsg-button vsg-button--danger" type="button" data-action="clearLog">Очистить лог</button>
      </article>
      <article class="vsg-card vsg-sport-profile-card">
        <div class="vsg-sport-profile-card-head"><div><span class="vsg-eyebrow">Информация</span><h2>Приложение</h2></div></div>
        <div class="vsg-sport-profile-info"><div><span>Платформа и версия</span><strong>${escapeHtml(getPlatformName())} · ${escapeHtml(getAppVersion())}</strong></div><div><span>Разработчик</span><strong>V-STAR-GROUP.DIGITAL</strong></div></div>
        <div class="vsg-sport-profile-actions"><button class="vsg-button" type="button" data-action="checkUpdate">Проверить обновление</button><button class="vsg-button" type="button" data-action="logout">Выйти</button></div>
      </article>
    </section>`;
}

function getPlatformName() { return window.Capacitor?.getPlatform?.() === "android" ? "Android" : "Web"; }
function getAppVersion() { return "1.003.1 от 30.07."; }
function getAvatarLetter(value) { return String(value || "S").slice(0, 1).toLocaleUpperCase("ru-RU"); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function escapeAttr(value) { return escapeHtml(value).replaceAll('"', "&quot;"); }
