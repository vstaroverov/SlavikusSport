export function renderHeader(user) {
  return `
    <header class="app-header">
      <button class="header-logo" data-route="main" aria-label="Главная">
        <img src="./src/assets/auth-logo.png" alt="" />
      </button>
      <div>
        <strong>Slavikus Sport</strong>
        <span>${user.plan}</span>
      </div>
      <button class="profile-button" data-route="profile" aria-label="Профиль">
        <img src="./src/assets/crown-icon.png" alt="" />
      </button>
    </header>
  `;
}
