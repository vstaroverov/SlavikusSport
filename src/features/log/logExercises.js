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
  const done = Array.isArray(result.done) ? result.done.map(String) : [];
  const weights = Array.isArray(result.weights)
    ? result.weights.map((value) => String(value || ""))
    : done.map(() => parseWeight(result.weight || "") || "");

  return {
    name: String(result.name || "").trim(),
    target: String(result.target || ""),
    weight: String(result.weight || ""),
    weights,
    sets: Number(result.sets || done.length || 0),
    done
  };
}

export function formatResultLine(result) {
  const normalized = normalizeResult(result);
  const sets = formatSetsInput(normalized);
  return [normalized.name, sets].filter(Boolean).join(" ");
}

function formatResultLineWithRecords(result, previousBest) {
  const normalized = normalizeResult(result);
  const best = previousBest.get(normalizeName(normalized.name)) || { repeats: 0, weight: 0 };
  let hasRecord = false;
  const sets = normalized.done.map((value, index) => {
    const weightText = normalized.weights[index] || "";
    const repeatsText = String(value || "").trim();
    const repeats = parseNumber(repeatsText);
    const weight = parseNumber(weightText);

    if (weight > 0) {
      if (weight > best.weight) hasRecord = true;
      return `${weightText}х${repeatsText}`;
    }

    if (repeats > best.repeats) hasRecord = true;
    return repeatsText;
  }).filter(Boolean).join(", ");

  const line = [normalized.name, sets].filter(Boolean).join(" ");
  return hasRecord ? `${line} ★` : line;
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
      const key = normalizeName(normalized.name);
      const best = bestMap.get(key) || { repeats: 0, weight: 0 };

      normalized.done.forEach((value, approachIndex) => {
        best.repeats = Math.max(best.repeats, parseNumber(value));
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
