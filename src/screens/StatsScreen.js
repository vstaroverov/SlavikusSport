import { getLogEntries } from "../features/log/logStorage.js";
import { buildExerciseStats } from "../features/stats/statsBuilder.js";
import { getAiRecommendation } from "../features/stats/aiRecommendations.js";
import { getExerciseCatalog } from "../features/exercises/exercisesStorage.js";

export function renderStatsScreen() {
  const entries = getLogEntries();
  const stats = buildExerciseStats(entries, getExerciseCatalog());
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(scrollStatChartsToLatest);
  return `
    <section class="vsg vsg-sport-stats-screen">
      <header class="vsg-sport-stats-heading"><span class="vsg-eyebrow">Результаты</span><h1>Стата</h1><p>Последние результаты и прогресс по упражнениям.</p></header>
      ${stats.length ? `
        <div class="vsg-sport-stats-overview" aria-label="Сводка"><div><strong>${entries.length}</strong><span>Записей в логе</span></div><div><strong>${stats.length}</strong><span>Упражнения</span></div></div>
        ${stats.map(renderStat).join("")}
      ` : `<div class="vsg-empty vsg-sport-stats-empty"><strong>Статистики пока нет</strong><p>Заверши тренировку или добавь результат в лог, чтобы увидеть прогресс.</p></div>`}
    </section>`;
}

function renderStat(stat) {
  if (stat.measure === "completion") return renderCompletionStat(stat);
  if (["distanceKm", "distanceM", "seconds"].includes(stat.measure)) return renderActivityStat(stat);
  return renderExerciseStat(stat);
}

function renderCardHead(stat, label, badge, badgeClass = "") {
  return `<div class="vsg-sport-stats-card-head"><div><span class="vsg-eyebrow">${label}${stat.measure === "completion" ? "" : ` · ${stat.points.length} ${pluralRecords(stat.points.length)}`}</span><h2>${escapeHtml(stat.name)}</h2></div><span class="vsg-badge ${badgeClass}">${badge}</span></div>`;
}

function renderMetric(label, value, unit = "", detail = "") {
  return `<div><span>${label}</span><strong>${value}${unit ? ` <small>${unit}</small>` : ""}</strong>${detail ? `<small>${detail}</small>` : ""}</div>`;
}

function renderHistory(points, formatPoint) {
  return `<div class="vsg-sport-stats-history"><strong>История</strong>${points.slice(-5).reverse().map((point) => `<div><span>${formatDate(point.date)}</span><b>${formatPoint(point)}</b></div>`).join("")}</div>`;
}

function renderCompletionStat(stat) {
  const completed = stat.points.filter((point) => point.value > 0);
  const latestCompleted = stat.points.at(-1)?.value > 0;
  return `<article class="vsg-card vsg-sport-stats-card">
    ${renderCardHead(stat, "Факт выполнения", latestCompleted ? "Выполнена" : "Пропущена", latestCompleted ? "vsg-badge--success" : "vsg-badge--warning")}
    <div class="vsg-sport-stats-metrics">${renderMetric("Выполнений", completed.length)}</div>
    ${renderHistory(stat.points, (point) => point.value > 0 ? "Выполнена" : "Пропущена")}
  </article>`;
}

function renderActivityStat(stat) {
  const unit = stat.measure === "distanceKm" ? "км" : stat.measure === "distanceM" ? "м" : "с";
  const distance = stat.measure !== "seconds";
  const latest = stat.points.at(-1);
  const label = distance ? "Дистанция" : "Время";
  return `<article class="vsg-card vsg-sport-stats-card">
    ${renderCardHead(stat, label, label)}
    <div class="vsg-sport-stats-metrics">
      ${renderMetric("Последний", formatNumber(latest.value), unit, distance && latest.timeSeconds ? `за ${formatDuration(latest.timeSeconds)}` : "")}
      ${renderMetric("Лучший", formatNumber(stat.bestValue), unit)}
    </div>
    ${renderHistory(stat.points, (point) => `${formatNumber(point.value)} ${unit}${distance && point.timeSeconds ? ` · ${formatDuration(point.timeSeconds)}` : ""}`)}
  </article>`;
}

function renderExerciseStat(stat) {
  const weighted = stat.measure === "weighted" || stat.points.some((point) => point.weight > 0);
  const hasWeightSeries = stat.points.some((point) => point.weight > 0);
  const values = stat.points.map((point) => point.value);
  const max = Math.max(...values, 1);
  const direction = getDirection(stat);
  return `<article class="vsg-card vsg-sport-stats-card">
    ${renderCardHead(stat, weighted ? "Повторения и вес" : "Повторения", direction.label, direction.badgeClass)}
    <div class="vsg-sport-stats-metrics">
      ${renderMetric("Последний", formatNumber(stat.latest), "повт.", weighted && stat.latestWeight > 0 ? `${formatNumber(stat.latestWeight)} кг` : "")}
      ${renderMetric("Лучший", formatNumber(stat.bestValue), "повт.", weighted && stat.bestWeight > 0 ? `до ${formatNumber(stat.bestWeight)} кг` : "")}
    </div>
    <div class="vsg-sport-stats-trend ${direction.className}">${getDynamicsText(stat, weighted)}</div>
    <div class="vsg-sport-stats-chart">
      <span class="vsg-sport-stats-chart-label">${hasWeightSeries ? "Динамика по датам" : "Повторения по датам"}</span>
      <div class="vsg-sport-stats-chart-scroll" role="group" aria-label="${escapeAttr(`График результатов: ${stat.name}`)}">
        <div class="vsg-sport-stats-plot" style="--points:${stat.points.length}">${stat.points.map((point, index) => renderRepeatBar(point, index, stat.points.length, max, hasWeightSeries)).join("")}${hasWeightSeries ? renderWeightLine(stat.points) : ""}</div>
      </div>
      ${hasWeightSeries ? `<div class="vsg-sport-stats-legend"><span data-series="repeats"><i></i>Повторения</span><span data-series="weight"><i></i>Вес, кг</span></div>` : ""}
    </div>
    ${weighted ? renderHistory(stat.points, (point) => `${formatNumber(point.value)} повт.${point.weight > 0 ? ` · ${formatNumber(point.weight)} кг` : ""}`) : ""}
    <p class="vsg-sport-stats-advice">${escapeHtml(getAiRecommendation(stat.name, values.slice().reverse()))}</p>
  </article>`;
}

function renderRepeatBar(point, index, count, max, hasWeightSeries) {
  const repeats = formatNumber(point.value);
  const weight = point.weight > 0 ? formatNumber(point.weight) : "";
  const date = formatDate(point.date);
  const label = `${date}: ${repeats} повторений${weight ? `, ${weight} кг` : hasWeightSeries ? ", вес не указан" : ""}`;
  const edge = index === 0 ? " vsg-sport-stats-bar--first" : index === count - 1 ? " vsg-sport-stats-bar--last" : "";
  return `<button type="button" class="vsg-sport-stats-bar${edge}" style="--height:${Math.max(5, Math.round(point.value / max * 100))}%" aria-label="${escapeAttr(label)}"><span>${repeats}</span><i></i><small>${date}</small><span class="vsg-sport-stats-tooltip" aria-hidden="true"><span>Повторения: ${repeats}</span>${weight ? `<span>Вес: ${weight} кг</span>` : ""}</span></button>`;
}

function renderWeightLine(points) {
  const maxWeight = Math.max(...points.map((point) => Number(point.weight) || 0));
  const coordinates = points.map((point, index) => {
    const weight = Number(point.weight) || 0;
    return weight > 0 ? { x: 26 + index * 52, y: Math.round(104 - weight / (maxWeight * 1.15) * 98), weight, date: point.date } : null;
  });
  let previous = false;
  const path = coordinates.map((point) => {
    if (!point) { previous = false; return ""; }
    const command = `${previous ? "L" : "M"}${point.x} ${point.y}`;
    previous = true;
    return command;
  }).filter(Boolean).join(" ");
  return `<svg class="vsg-sport-stats-weight-line" viewBox="0 0 ${points.length * 52} 110" aria-hidden="true"><path d="${path}"/>${coordinates.filter(Boolean).map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5"><title>${formatDate(point.date)} · ${formatNumber(point.weight)} кг</title></circle>`).join("")}</svg>`;
}

function getDirection(stat) {
  if (stat.points.length < 2) return { label: "Новый", badgeClass: "", className: "neutral" };
  if (stat.trendValue > 0 || stat.trendWeight > 0) return { label: "Рост", badgeClass: "vsg-badge--success", className: "positive" };
  if (stat.trendValue < 0) return { label: "Снижение", badgeClass: "vsg-badge--warning", className: "negative" };
  return { label: "Без изменений", badgeClass: "", className: "neutral" };
}

function getDynamicsText(stat, weighted) {
  if (stat.points.length < 2) return "Добавь ещё результат, чтобы увидеть динамику.";
  const parts = [formatSigned(stat.trendValue, "повт.")];
  if (weighted && stat.trendWeight) parts.push(formatSigned(stat.trendWeight, "кг"));
  if (stat.trendPercent) parts.push(formatSigned(stat.trendPercent, "%"));
  return `Динамика: ${parts.join(" · ")}`;
}

function scrollStatChartsToLatest() {
  document.querySelectorAll(".vsg-sport-stats-chart-scroll").forEach((chart) => { chart.scrollLeft = chart.scrollWidth; });
}

function formatSigned(value, unit) { return `${value > 0 ? "+" : ""}${formatNumber(value)} ${unit}`; }
function formatNumber(value) { return Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 1 }); }
function pluralRecords(count) { return count % 10 === 1 && count % 100 !== 11 ? "запись" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "записи" : "записей"; }
function formatDate(value) { const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})/); return match ? `${match[1]}.${match[2]}` : escapeHtml(value); }
function formatDuration(total) { const seconds = Math.round(total); const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const rest = String(seconds % 60).padStart(2, "0"); return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function escapeAttr(value) { return escapeHtml(value).replaceAll('"', "&quot;"); }
