export function renderVkLogin() {
  return `
    <div class="auth-shell">
      <section class="auth-card">
        <img class="auth-logo" src="./src/assets/auth-logo.png" alt="Slavikus Sport" />
        <h1>Slavikus Sport</h1>
        <p>Тренировка дня, быстрый старт, лог и прогресс без лишних экранов.</p>
        <button class="primary-button vk-button" data-action="loginVk">
          <span class="auth-button-icon vk-icon">VK</span>
          <span>Войти через VK ID</span>
        </button>
        <div class="auth-divider"><span>или войти через</span></div>
        <div class="auth-tabs">
          <button data-action="loginPhone">
            <span class="auth-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/></svg>
            </span>
            <span>Телефон</span>
          </button>
          <button data-action="loginEmail">
            <span class="auth-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
            </span>
            <span>Почта</span>
          </button>
        </div>
      </section>
    </div>
  `;
}
