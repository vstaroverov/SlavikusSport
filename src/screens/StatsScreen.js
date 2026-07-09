import { getCurrentUser } from "../features/profile/profileStorage.js";
import { getSubscriptionState } from "../features/profile/premiumSubscription.js";
import { getLogEntries } from "../features/log/logStorage.js";
import { buildExerciseStats } from "../features/stats/statsBuilder.js";
import { getAiRecommendation } from "../features/stats/aiRecommendations.js";

export function renderStatsScreen() {
  const subscription = getSubscriptionState(getCurrentUser());
  if (subscription.daysLeft <= 0) {
    return `
      <section class="premium-lock">
        <h1>Стата</h1>
        <p>Графики по упражнениям и ИИ-рекомендации доступны в Premium.</p>
        <button class="primary-button" data-route="profile">Подключить Premium</button>
      </section>
    `;
  }

  const stats = buildExerciseStats(getLogEntries());

  return `
    <section class="stack">
      <h1>Стата</h1>
      ${stats.length ? stats.map(renderExerciseStat).join("") : `
        <div class="empty-state">Выполненные упражнения появятся здесь после первой тренировки.</div>
      `}
    </section>
  `;
}

function renderExerciseStat(stat) {
  const values = stat.points.map((point) => point.value);
  const weights = stat.points.map((point) => point.weight || 0);
  const max = Math.max(...values, 1);
  const mid = Math.round(max / 2);
  const maxWeight = Math.max(...weights, 1);
  const midWeight = Math.round(maxWeight / 2);
  const direction = stat.latest > stat.previous ? "рост" : stat.latest < stat.previous ? "просадка" : "ровно";

  return `
    <article class="chart-card exercise-stat-card">
      <div class="stat-head">
        <div>
          <strong>${stat.name}</strong>
          <span>${stat.points.length} записей · ${direction} · ${stat.latestWeight || 0} кг</span>
        </div>
        <b>${stat.latest}</b>
      </div>
      <div class="stat-chart">
        <div class="stat-y-axis">
          <small>Повторы</small>
          <span>${max}</span>
          <span>${mid}</span>
          <span>0</span>
        </div>
        <div class="stat-plot">
          <div class="stat-bars">
            ${stat.points.map((point) => `
              <span class="stat-bar" style="height:${Math.max(12, point.value / max * 118)}px" title="${point.date}: ${point.value} повторов, ${point.weight || 0} кг">
                <i style="height:${Math.max(6, (point.weight || 0) / maxWeight * 118)}px"></i>
              </span>
            `).join("")}
          </div>
          <div class="stat-dates">
            ${stat.points.map((point) => `
              <span>${formatDate(point.date)}</span>
            `).join("")}
          </div>
        </div>
        <div class="stat-y-axis stat-y-axis-right">
          <small>Вес</small>
          <span>${maxWeight}</span>
          <span>${midWeight}</span>
          <span>0</span>
        </div>
      </div>
      <p>${getAiRecommendation(stat.name, values.slice().reverse())}</p>
    </article>
  `;
}

function formatDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return "";
  return `${match[1]}.${match[2]}`;
}
