export function getLogResults(entry) {
  if (Array.isArray(entry.results) && entry.results.length) {
    return entry.results.map(normalizeResult).filter((result) => result.name);
  }

  return parseLogText(entry.text || "");
}

export function formatLogText(results) {
  return results.map(formatResultLine).join("\n");
}

export function formatLogTextWithRecords(entry, entries) {
  const results = getLogResults(entry);
  const previousBest = buildPreviousBestMap(entry, entries);
  return results.map((result) => formatResultLineWithRecords(result, previousBest)).join("\n");
}

export function getWorkoutRecords(entry, entries = []) {
  const previousBest = buildPreviousBestMap(entry, entries);
  const records = [];

  getLogResults(entry).forEach((result) => {
    const normalized = normalizeResult(result);
    if (normalized.measure === "completion") return;
    const best = previousBest.get(normalizeName(normalized.name)) || { repeats: 0, weight: 0, distance: 0 };
    if (isDistanceResult(normalized)) {
      const distance = Math.max(0, ...normalized.done.map((value) => Number(String(value).replace(",", ".")) || 0));
      if (distance > best.distance) records.push({
        name: normalized.name,
        type: normalized.measure,
        value: distance,
        previous: best.distance
      });
      return;
    }
    let bestRepeats = 0;
    let bestWeight = 0;

    normalized.done.forEach((value, index) => {
      const repeats = parseNumber(value);
      if (repeats <= 0) return;
      bestRepeats = Math.max(bestRepeats, repeats);
      bestWeight = Math.max(bestWeight, parseNumber(normalized.weights[index] || normalized.weight));
    });

    if (bestWeight > best.weight && bestWeight > 0) {
      records.push({
        name: normalized.name,
        type: "weight",
        value: bestWeight,
        previous: best.weight
      });
      return;
    }

    if (bestRepeats > best.repeats && bestRepeats > 0) {
      records.push({
        name: normalized.name,
        type: normalized.measure === "seconds" ? "seconds" : "repeats",
        value: bestRepeats,
        previous: best.repeats
      });
    }
  });

  return records;
}

export function parseSetText(value) {
  const text = String(value || "").trim();
  if (!text) return { done: [], weights: [] };

  const parts = text.split(/[,;\n]+/).map((part) => part.trim()).filter(Boolean);
  const done = [];
  const weights = [];

  parts.forEach((part) => {
    if (/^\+$/.test(part)) {
      done.push("+");
      weights.push("");
      return;
    }

    if (/^\d+(?:\s*[xх]\s*\d+){2,}$/i.test(part)) {
      part.match(/\d+/g).forEach((number) => {
        done.push(number);
        weights.push("");
      });
      return;
    }

    const weighted = part.match(/(\d+(?:[.,]\d+)?)\s*[xх]\s*(\d+)/i);
    if (weighted) {
      weights.push(weighted[1].replace(",", "."));
      done.push(weighted[2]);
      return;
    }

    const seconds = part.match(/(\d+)\s*(с|сек|секунд)$/i);
    if (seconds) {
      done.push(`${seconds[1]}с`);
      weights.push("");
      return;
    }

    const number = part.match(/\d+/)?.[0];
    done.push(number || part);
    weights.push("");
  });

  return { done, weights };
}

export function formatSetsInput(result) {
  const normalized = normalizeResult(result);
  return normalized.done.map((value, index) => {
    const weight = normalized.weights[index] || "";
    if (weight) return `${weight}х${value}`;
    return value;
  }).join(", ");
}

export function getResultSummary(result) {
  const normalized = normalizeResult(result);
  return {
    weight: normalized.weights.find(Boolean) || parseWeight(normalized.weight || ""),
    repeats: normalized.done.find(Boolean) || "",
    sets: normalized.sets || normalized.done.length || 1
  };
}

export function isRunMeterInput(result) {
  return result.measure === "distanceKm" && normalizeName(result.name) === "бег";
}

export function buildResultFromCells(name, weight, repeats, sets) {
  const setCount = Math.max(1, Number(sets) || 1);
  const cleanWeight = parseWeight(weight);
  const cleanRepeats = String(repeats || "0").trim() || "0";

  return normalizeResult({
    name,
    target: cleanRepeats,
    weight: cleanWeight,
    weights: Array.from({ length: setCount }, () => cleanWeight),
    sets: setCount,
    done: Array.from({ length: setCount }, () => cleanRepeats)
  });
}

export function normalizeResult(result) {
  const isHang = String(result.name || "").trim().toLocaleLowerCase("ru-RU") === "вис";
  const isCompletionExercise = ["разминка", "заминка"].includes(String(result.name || "").trim().toLocaleLowerCase("ru-RU"));
  const measure = isCompletionExercise ? "completion" : isHang ? "seconds" : String(result.measure || "");
  const done = Array.isArray(result.done) ? result.done.map((value) => {
    const text = String(value);
    if (measure === "completion") return text === "+" || parseNumber(text) > 0 ? "1" : "0";
    return measure === "seconds" ? text.replace(/^\d+(?:[.,]\d+)?\s*[xх]\s*(\d+)$/i, "$1") : text;
  }) : [];
  const weights = measure === "seconds" || measure === "completion" ? done.map(() => "") : Array.isArray(result.weights)
    ? result.weights.map((value) => String(value || ""))
    : done.map(() => parseWeight(result.weight || "") || "");

  return {
    name: String(result.name || "").trim(),
    measure,
    target: measure === "completion" ? "" : String(result.target || ""),
    weight: measure === "seconds" || measure === "completion" ? "" : String(result.weight || ""),
    weights,
    times: Array.isArray(result.times) ? result.times.map(Number) : [],
    routes: Array.isArray(result.routes) ? result.routes : [],
    sets: measure === "completion" ? 1 : Number(result.sets || done.length || 0),
    done
  };
}

export function formatResultLine(result) {
  const normalized = normalizeResult(result);
  if (normalized.measure === "completion") return `${normalized.name} · ${normalized.done.includes("1") ? "Выполнена" : "Пропущена"}`;
  if (isDistanceResult(normalized)) return formatDistanceLine(normalized);
  if (normalized.measure === "seconds") return [normalized.name, normalized.done.map((value) => Number(value) > 0 ? `${value} с` : "").filter(Boolean).join(", ")].filter(Boolean).join(" ");
  const sets = formatSetsInput(normalized);
  return [normalized.name, sets].filter(Boolean).join(" ");
}

function formatResultLineWithRecords(result, previousBest) {
  const normalized = normalizeResult(result);
  if (normalized.measure === "completion") return formatResultLine(normalized);
  if (isDistanceResult(normalized)) {
    const previous = previousBest.get(normalizeName(normalized.name))?.distance || 0;
    const distance = Math.max(0, ...normalized.done.map((value) => Number(String(value).replace(",", ".")) || 0));
    const line = formatDistanceLine(normalized);
    return distance > previous ? `${line} ★` : line;
  }
  if (normalized.measure === "seconds") {
    const best = previousBest.get(normalizeName(normalized.name))?.repeats || 0;
    const current = Math.max(0, ...normalized.done.map(parseNumber));
    const line = formatResultLine(normalized);
    return current > best ? `${line} ★` : line;
  }
  const best = previousBest.get(normalizeName(normalized.name)) || { repeats: 0, weight: 0 };
  let hasRecord = false;
  const sets = normalized.done.map((value, index) => {
    const weightText = normalized.weights[index] || "";
    const repeatsText = String(value || "").trim();
    const repeats = parseNumber(repeatsText);
    const weight = parseNumber(weightText);

    if (weight > 0 && repeats > 0) {
      if (weight > best.weight) hasRecord = true;
      return `${weightText}х${repeatsText}`;
    }

    if (repeats > best.repeats) hasRecord = true;
    return repeatsText;
  }).filter(Boolean).join(", ");

  const line = [normalized.name, sets].filter(Boolean).join(" ");
  return hasRecord ? `${line} ★` : line;
}

function isDistanceResult(result) {
  return result.measure === "distanceKm" || result.measure === "distanceM";
}

function formatDistanceLine(result) {
  const unit = result.measure === "distanceKm" ? "км" : "м";
  const sets = result.done.map((distance, index) => {
    const value = Number(String(distance).replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return "";
    const seconds = Number(result.times[index] || 0);
    const time = seconds > 0 ? ` за ${formatDuration(seconds)}` : "";
    return `${distance} ${unit}${time}`;
  }).filter(Boolean).join(", ");
  return [result.name, sets].filter(Boolean).join(" ");
}

function formatDuration(total) {
  const seconds = Math.round(total);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

function buildPreviousBestMap(entry, entries = []) {
  const currentIndex = entries.findIndex((candidate) => candidate.id === entry.id);
  const currentTime = parseRuDate(entry.finishedAt)?.getTime() || 0;
  const bestMap = new Map();

  entries.forEach((candidate, index) => {
    if (candidate.id === entry.id) return;

    const candidateTime = parseRuDate(candidate.finishedAt)?.getTime() || 0;
    const isPrevious = currentTime && candidateTime
      ? candidateTime < currentTime
      : index > currentIndex;
    if (!isPrevious) return;

    getLogResults(candidate).forEach((result) => {
      const normalized = normalizeResult(result);
      if (normalized.measure === "completion") return;
      const key = normalizeName(normalized.name);
      const best = bestMap.get(key) || { repeats: 0, weight: 0, distance: 0 };

      if (isDistanceResult(normalized)) {
        normalized.done.forEach((value) => {
          best.distance = Math.max(best.distance, Number(String(value).replace(",", ".")) || 0);
        });
        bestMap.set(key, best);
        return;
      }

      normalized.done.forEach((value, approachIndex) => {
        const repeats = parseNumber(value);
        if (repeats <= 0) return;
        best.repeats = Math.max(best.repeats, repeats);
        best.weight = Math.max(best.weight, parseNumber(normalized.weights[approachIndex] || normalized.weight));
      });

      bestMap.set(key, best);
    });
  });

  return bestMap;
}

function normalizeName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
}

function parseLogText(text) {
  return String(text).split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const separatorIndex = findFirstValueIndex(trimmed);
    if (separatorIndex <= 0) return null;

    const rawName = trimmed.slice(0, separatorIndex).replace(/[:—-]\s*$/, "").trim();
    const rawSets = trimmed.slice(separatorIndex).replace(/^[:—-]\s*/, "").trim();
    const parsed = parseSetText(rawSets);

    return normalizeResult({
      name: rawName,
      done: parsed.done,
      weights: parsed.weights,
      sets: parsed.done.length
    });
  }).filter(Boolean);
}

function findFirstValueIndex(value) {
  const match = value.match(/\s(?:\+|\d)/);
  return match ? match.index + 1 : -1;
}

function parseWeight(value) {
  return String(value).match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".") || "";
}

function parseNumber(value) {
  const number = String(value || "").match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  return Number(number.replace(",", ".")) || 0;
}

function parseRuDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4}),?\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5]));
}
