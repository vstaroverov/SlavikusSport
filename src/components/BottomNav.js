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
    <nav class="bottom-nav">
      ${items.map(([route, iconName, label]) => `
        <button class="${active === route ? "active" : ""}" data-route="${route}">
          <span class="nav-icon">${icon(iconName)}</span>
          <span class="nav-label">${label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}
