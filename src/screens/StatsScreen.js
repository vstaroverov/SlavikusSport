import { getLogEntries } from "../features/log/logStorage.js";
import { buildExerciseStats } from "../features/stats/statsBuilder.js";
import { getAiRecommendation } from "../features/stats/aiRecommendations.js";
import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";

export function renderStatsScreen() {
  const stats = buildExerciseStats(getLogEntries(), getExerciseCatalog());

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

  return `
    <article class="chart-card exercise-stat-card">
      <div class="stat-head">
        <div>
          <strong>${escapeHtml(stat.name)}</strong>
          <span>${stat.points.length} записей · ${getDirectionLabel(stat)} · ${formatWeight(stat.latestWeight)} кг</span>
        </div>
        <b>${stat.latest}</b>
      </div>
      <div class="stat-dynamics ${getDirectionClass(stat)}">
        <strong>${getDynamicsText(stat)}</strong>
        <span>Лучшее: ${stat.bestValue} повторов · ${formatWeight(stat.bestWeight)} кг</span>
      </div>
      <div class="stat-chart">
        <div class="stat-y-axis">
          <small>Повторы</small>
          <span class="axis-max">${max}</span>
          <span class="axis-mid">${mid}</span>
          <span class="axis-zero">0</span>
        </div>
        <div class="stat-plot-scroll">
          <div class="stat-series" style="--points:${stat.points.length}">
            <div class="stat-bars">
              ${stat.points.map((point) => renderPoint(point, max, maxWeight)).join("")}
            </div>
            <div class="stat-dates">
              ${stat.points.map((point) => `
                <span>${formatDate(point.date)}</span>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="stat-y-axis stat-y-axis-right">
          <small>Вес</small>
          <span class="axis-max">${formatWeight(maxWeight)}</span>
          <span class="axis-mid">${formatWeight(midWeight)}</span>
          <span class="axis-zero">0</span>
        </div>
      </div>
      <p>${getAiRecommendation(stat.name, values.slice().reverse())}</p>
    </article>
  `;
}

function renderPoint(point, max, maxWeight) {
  const chartHeight = 120;
  const repeatHeight = Math.max(12, point.value / max * chartHeight);
  const weightHeight = point.weight > 0 ? Math.max(6, point.weight / maxWeight * chartHeight) : 0;
  const title = `${point.date}: ${point.value} повторов, ${formatWeight(point.weight)} кг`;

  return `
    <span class="stat-bar" style="height:${repeatHeight}px" title="${escapeAttr(title)}">
      <i style="height:${weightHeight}px"></i>
    </span>
  `;
}

function getDirectionLabel(stat) {
  if (stat.points.length < 2) return "мало данных";
  if (stat.trendValue > 0) return "рост";
  if (stat.trendValue < 0) return "просадка";
  if (stat.trendWeight > 0) return "вес растет";
  return "ровно";
}

function getDirectionClass(stat) {
  if (stat.trendValue > 0 || stat.trendWeight > 0) return "positive";
  if (stat.trendValue < 0) return "negative";
  return "neutral";
}

function getDynamicsText(stat) {
  if (stat.points.length < 2) return "Нужна еще одна запись для динамики";

  const repeats = formatSigned(stat.trendValue, "повт.");
  const weight = formatSigned(stat.trendWeight, "кг");
  const percent = stat.trendPercent ? ` · ${formatSigned(stat.trendPercent, "%")}` : "";
  return `Динамика: ${repeats} · ${weight}${percent}`;
}

function formatSigned(value, unit) {
  if (!value) return `0 ${unit}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatWeight(value)} ${unit}`;
}

function formatWeight(value) {
  return Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function formatDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return "";
  return `${match[1]}.${match[2]}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
