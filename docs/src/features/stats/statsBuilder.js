import { parseSetText } from "../log/logExercises.js";

export function buildExerciseStats(entries, catalog = []) {
  const map = new Map();
  const catalogByName = new Map(catalog.map((exercise) => [normalizeName(exercise.name), exercise.name]));

  [...entries].map((entry, index) => ({
    ...entry,
    order: index,
    timestamp: parseRuDate(entry.finishedAt)?.getTime() || 0
  })).sort((a, b) => {
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    return b.order - a.order;
  }).forEach((entry) => {
    const date = entry.finishedAt || "";
    const textNames = new Set();

    String(entry.text || "").split("\n").forEach((line) => {
      const parsed = parseTextLine(line);
      if (!parsed) return;
      const name = catalogByName.get(normalizeName(parsed.name)) || parsed.name;
      if (catalog.length && !catalogByName.has(normalizeName(parsed.name))) return;
      textNames.add(normalizeName(name));
      addPoint(map, name, {
        date,
        value: parsed.repeats,
        target: parsed.target,
        weight: parsed.weight,
        sets: parsed.sets,
        volume: parsed.repeats * parsed.weight
      });
    });

    if (Array.isArray(entry.results) && entry.results.length) {
      entry.results.forEach((result) => {
        const name = catalogByName.get(normalizeName(result.name)) || result.name;
        if (catalog.length && !catalogByName.has(normalizeName(result.name))) return;
        const repeats = sumNumbers(result.done);
        const weight = getResultWeight(result);
        const hasTextValue = textNames.has(normalizeName(name));
        addPoint(map, name, {
          date,
          value: hasTextValue ? 0 : repeats,
          target: result.target,
          weight,
          sets: result.sets || result.done?.length || 0,
          volume: hasTextValue ? 0 : repeats * weight
        });
      });
    }
  });

  return [...map.values()]
    .map((item) => buildExerciseSummary(item.name, [...item.points.values()]))
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp || a.name.localeCompare(b.name, "ru"));
}

function addPoint(map, name, point) {
  const nameKey = normalizeName(name);
  const dateKey = getDateKey(point.date);

  if (!map.has(nameKey)) {
    map.set(nameKey, {
      name: cleanName(name),
      points: new Map()
    });
  }

  const item = map.get(nameKey);
  if (!item.points.has(dateKey)) {
    item.points.set(dateKey, {
      date: point.date,
      dateKey,
      timestamp: parseRuDate(point.date)?.getTime() || 0,
      value: 0,
      target: "",
      weight: 0,
      sets: 0,
      volume: 0
    });
  }

  const current = item.points.get(dateKey);
  current.value += point.value || 0;
  current.weight = Math.max(current.weight || 0, point.weight || 0);
  current.sets += point.sets || 0;
  current.volume += point.volume || 0;
  current.target = current.target || point.target || "";
  if ((point.weight || 0) > 0) current.volume = current.value * current.weight;
}

function sumNumbers(values = []) {
  return values.reduce((sum, value) => {
    const number = Number(String(value).match(/\d+/)?.[0] || 0);
    return sum + number;
  }, 0);
}

function parseWeight(value) {
  if (hasTimeUnit(value)) return 0;
  const numbers = String(value).match(/\d+(?:[.,]\d+)?/g) || [];
  return numbers.reduce((max, item) => Math.max(max, Number(item.replace(",", ".")) || 0), 0);
}

function getResultWeight(result) {
  const weights = Array.isArray(result.weights) ? result.weights : [];
  return Math.max(parseWeight(result.weight || ""), ...weights.map(parseWeight));
}

function parseTextLine(line) {
  const normalized = String(line)
    .replace(/\s+/g, " ")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
    .trim();
  if (!normalized) return null;

  const separatorMatch = normalized.match(/\s*[:–—-]\s*/);
  const separatorIndex = separatorMatch ? normalized.search(/\s*[:–—-]\s*/) : -1;
  const rawName = separatorIndex >= 0 ? normalized.slice(0, separatorIndex) : guessName(normalized);
  const rawValue = separatorIndex >= 0
    ? normalized.slice(separatorIndex + separatorMatch[0].length)
    : normalized.slice(rawName.length);

  if (!rawName || !rawValue) return null;

  const weightMatch = rawName.match(/\(([^)]+)\)/);
  const name = cleanName(rawName
    .replace(/\([^)]*\)/g, "")
    .replace(/(^|\s)\d+(?:[.,]\d+)?\s*кг(?=\s|$)/gi, " ")
    .replace(/\s*[,;]+$/g, "")
  );
  const parsedSets = parseSetText(rawValue);
  const repeats = sumNumbers(parsedSets.done);
  const weight = parseWeight(
    weightMatch?.[1]
    || rawName.match(/(^|\s)\d+(?:[.,]\d+)?\s*кг(?=\s|$)/i)?.[0]
    || rawValue.match(/(^|\s)\d+(?:[.,]\d+)?\s*кг(?=\s|$)/i)?.[0]
    || Math.max(0, ...parsedSets.weights.map(parseWeight))
    || ""
  );
  const sets = parsedSets.done.length;

  if (!name || !parsedSets.done.length) return null;
  return {
    name,
    repeats,
    weight,
    sets,
    target: rawValue.trim()
  };
}

function guessName(value) {
  const numberMatch = value.match(/\d+(?:[.,]\d+)?(?:\s*кг\b)?/i);
  if (!numberMatch) return "";
  return value.slice(0, numberMatch.index).trim();
}

function cleanName(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeName(value) {
  return cleanName(value).toLocaleLowerCase("ru-RU");
}

function getDateKey(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return String(value || "");
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function hasTimeUnit(value) {
  return /(^|\s)\d+(?:[.,]\d+)?\s*(?:мин|минута|минут|сек|секунда|секунд|час|часа|часов|ч)(?=\s|$)/i.test(String(value));
}

function buildExerciseSummary(name, points) {
  points.sort((a, b) => a.timestamp - b.timestamp);
  const latestPoint = points.at(-1) || {};
  const previousPoint = points.at(-2) || {};
  const latest = latestPoint.value || 0;
  const previous = previousPoint.value || 0;
  const latestWeight = latestPoint.weight || 0;
  const previousWeight = previousPoint.weight || 0;
  const trendValue = latest - previous;
  const trendWeight = latestWeight - previousWeight;
  const trendPercent = previous > 0 ? Math.round(trendValue / previous * 100) : 0;

  return {
    name,
    points,
    latest,
    previous,
    latestWeight,
    previousWeight,
    trendValue,
    trendWeight,
    trendPercent,
    totalVolume: points.reduce((sum, point) => sum + (point.volume || 0), 0),
    bestValue: Math.max(...points.map((point) => point.value), 0),
    bestWeight: Math.max(...points.map((point) => point.weight || 0), 0),
    lastTimestamp: parseRuDate(latestPoint.date)?.getTime() || 0
  };
}

function parseRuDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4}),?\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5]));
}
