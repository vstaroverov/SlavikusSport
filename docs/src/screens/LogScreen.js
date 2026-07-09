import { renderWorkoutLogCard } from "../components/WorkoutLogCard.js";
import { getLogEntries } from "../features/log/logStorage.js";

export function renderLogScreen() {
  const entries = getLogEntries();

  return `
    <section class="stack">
      <div class="section-head">
        <h1>Лог</h1>
        <button class="round-add" data-action="addManualLog" aria-label="Добавить запись в лог">+</button>
      </div>
      ${entries.length ? entries.map(renderWorkoutLogCard).join("") : `
        <div class="empty-state">Завершенные тренировки появятся здесь.</div>
      `}
    </section>
  `;
}
