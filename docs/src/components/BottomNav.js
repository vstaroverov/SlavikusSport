import { icon } from "./Icon.js";

const items = [
  ["main", "home", "Главная"],
  ["workout", "play", "Тренировка"],
  ["program", "plus", "Программа"],
  ["log", "list", "Лог"],
  ["stats", "stats", "Стата"]
];

export function renderBottomNav(active) {
  return `
    <footer class="vsg sport-footer-scope">
      <nav class="vsg-sport-bottom-nav sport-bottom-nav" aria-label="Основные разделы">
        ${items.map(([route, iconName, label]) => `
          <button type="button" data-route="${route}" ${active === route ? 'aria-current="page"' : ""}>
            <span aria-hidden="true">${icon(iconName)}</span>
            <span>${label}</span>
          </button>
        `).join("")}
      </nav>
    </footer>
  `;
}
