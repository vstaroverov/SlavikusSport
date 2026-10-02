import test from "node:test";
import assert from "node:assert/strict";
import { renderStatsScreen } from "../src/screens/StatsScreen.js";

test("stats screen shows units for each exercise type and omits zero weight", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  memory.set("slavikus:user", JSON.stringify({ id: "stats-design" }));
  memory.set("slavikus:log:stats-design", JSON.stringify([
    { id: "stats-1", finishedAt: "01.10.2026, 12:00", results: [
      { name: "Бег", measure: "distanceKm", done: ["5.2"], times: [1710] },
      { name: "Заплыв", measure: "distanceM", done: ["400"], times: [540] },
      { name: "Вис", measure: "seconds", done: ["60"] },
      { name: "Разминка", measure: "completion", done: ["1"] },
      { name: "Подтягивания", measure: "repeats", done: ["10", "8"] },
      { name: "Подтягивания с весом", measure: "weighted", done: ["6"], weight: "10" }
    ] }
  ]));

  const html = renderStatsScreen();
  assert.match(html, /vsg-sport-stats-overview/);
  assert.match(html, /5,2 <small>км<\/small>/);
  assert.match(html, /за 28:30/);
  assert.match(html, /400 <small>м<\/small>/);
  assert.match(html, /60 <small>с<\/small>/);
  assert.match(html, /Факт выполнения/);
  assert.match(html, /18 <small>повт\.<\/small>/);
  assert.match(html, /10 кг/);
  assert.doesNotMatch(html, /(?:^|[^\d])0 кг/);
  assert.match(html, /01\.10/);
});

test("stats charts show repeat bars and a weight line with gaps for missing weights", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: null };
  memory.set("slavikus:user", JSON.stringify({ id: "stats-weight-line" }));
  memory.set("slavikus:log:stats-weight-line", JSON.stringify([5, 10, 0, 15].map((weight, index) => ({
    id: `stats-weight-${index}`,
    finishedAt: `0${index + 1}.10.2026, 12:00`,
    results: [
      { name: "Подтягивания с весом", measure: "weighted", done: [String(6 + index)], weight: weight ? String(weight) : "" },
      { name: "Отжимания", measure: "repeats", done: [String(10 + index)] }
    ]
  }))));

  const html = renderStatsScreen();
  const weightedCard = html.match(/<article class="vsg-card vsg-sport-stats-card">(?:(?!<\/article>)[\s\S])*Подтягивания с весом(?:(?!<\/article>)[\s\S])*<\/article>/)?.[0];
  const plainCard = html.match(/<article class="vsg-card vsg-sport-stats-card">(?:(?!<\/article>)[\s\S])*Отжимания(?:(?!<\/article>)[\s\S])*<\/article>/)?.[0];
  assert.ok(weightedCard);
  assert.ok(plainCard);
  assert.match(weightedCard, /style="--points:4"/);
  assert.match(weightedCard, /<path d="M26 \d+ L78 \d+ M182 \d+"\/>/);
  assert.equal((weightedCard.match(/<circle /g) || []).length, 3);
  assert.match(weightedCard, /Вес, кг/);
  assert.match(weightedCard, /вес не указан/);
  assert.match(weightedCard, /\+5 кг/);
  assert.doesNotMatch(weightedCard, /\+15 кг/);
  assert.doesNotMatch(plainCard, /vsg-sport-stats-weight-line/);
  const weightedBars = [...weightedCard.matchAll(/<button type="button" class="vsg-sport-stats-bar[^>]*>[\s\S]*?<\/button>/g)].map(([bar]) => bar);
  const plainBars = [...plainCard.matchAll(/<button type="button" class="vsg-sport-stats-bar[^>]*>[\s\S]*?<\/button>/g)].map(([bar]) => bar);
  assert.equal(weightedBars.length, 4);
  assert.equal(plainBars.length, 4);
  assert.match(weightedBars[0], /aria-label="01\.10: 6 повторений, 5 кг"/);
  assert.match(weightedBars[0], /Повторения: 6<\/span><span>Вес: 5 кг/);
  assert.match(weightedBars[2], /Повторения: 8/);
  assert.doesNotMatch(weightedBars[2], /Вес:/);
  assert.match(plainBars[0], /Повторения: 10/);
  assert.doesNotMatch(plainBars[0], /Вес:/);
});
