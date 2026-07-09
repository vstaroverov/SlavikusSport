import { renderWorkoutLogCard } from "../components/WorkoutLogCard.js";
import { getLogEntries } from "../features/log/logStorage.js";

export function renderLogScreen() {
  const entries = getLogEntries();
  return `
    <section class="stack">
      <h1>Лог</h1>
      ${entries.length ? entries.map(renderWorkoutLogCard).join("") : `
        <div class="empty-state">Завершенные тренировки появятся здесь.</div>
      `}
    </section>
  `;
}
