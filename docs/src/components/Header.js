export function renderHeader(user) {
  return `
    <div class="vsg sport-header-scope">
      <header class="vsg-sport-app-header sport-app-header">
        <button class="vsg-sport-brand sport-brand-link" type="button" data-route="main" aria-label="На главную">
          <img src="./design-system-v-star-group/assets/slavikus-sport-logo.svg" alt="" />
          <span><strong>Slavikus Sport</strong><small>${escapeHtml(user?.plan || "Тренировки")}</small></span>
        </button>
        <button class="vsg-sport-profile-trigger" type="button" data-route="profile" aria-label="Открыть профиль">
          <img src="./design-system-v-star-group/assets/slavikus-sport-crown.svg" alt="" />
        </button>
      </header>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
