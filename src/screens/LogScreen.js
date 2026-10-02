import { renderWorkoutLogCard } from "../components/WorkoutLogCard.js";
import { getLogEntries } from "../features/log/logStorage.js";

export function renderLogScreen() {
  const entries = getLogEntries();

  return `
    <section class="vsg vsg-sport-log-screen" aria-labelledby="sport-log-title">
      <div class="vsg-sport-log-page-head">
        <div><span class="vsg-eyebrow">История</span><h1 id="sport-log-title">Лог</h1><p class="vsg-muted">${entries.length ? `${entries.length} ${plural(entries.length, "тренировка", "тренировки", "тренировок")}` : "Результаты тренировок"}</p></div>
        <button class="vsg-button vsg-button--primary" type="button" data-action="addManualLog" aria-label="Добавить запись в лог">+ Запись</button>
      </div>
      ${entries.length ? entries.map((entry) => renderWorkoutLogCard(entry, entries, true)).join("") : `
        <div class="vsg-empty vsg-sport-log-empty"><h2>Записей пока нет</h2><p>Заверши тренировку, чтобы сохранить результаты здесь.</p><button class="vsg-button vsg-button--primary" type="button" data-route="workout">Начать тренировку</button></div>
      `}
    </section>
  `;
}

function plural(count, one, few, many) {
  const value = Math.abs(count) % 100;
  const digit = value % 10;
  return value > 10 && value < 20 ? many : digit === 1 ? one : digit >= 2 && digit <= 4 ? few : many;
}
