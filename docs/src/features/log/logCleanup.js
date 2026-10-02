import { formatLogText, getLogResults, normalizeResult } from "./logExercises.js";

export function cleanZeroLogEntries(entries, skipIds = new Set()) {
  return entries.flatMap((entry) => {
    if (skipIds.has(entry.id)) return [entry];
    const results = getLogResults(entry);
    if (!results.length) return !String(entry.text || "").trim() || isOnlyZeroText(entry.text) ? [] : [entry];

    const cleanedResults = results.flatMap((result) => {
      const completedIndexes = result.done
        .map((value, index) => hasCompletedValue(value) ? index : -1)
        .filter((index) => index >= 0);
      if (!completedIndexes.length) return [];
      const normalized = normalizeResult(result);
      return [{
        ...normalized,
        done: completedIndexes.map((index) => normalized.done[index]),
        weights: completedIndexes.map((index) => normalized.weights[index] || ""),
        times: completedIndexes.map((index) => normalized.times[index] || 0),
        sets: normalized.measure === "completion" ? 1 : completedIndexes.length
      }];
    });
    if (!cleanedResults.length) return [];
    if (JSON.stringify(cleanedResults) === JSON.stringify(results)) return [entry];
    return [{ ...entry, results: cleanedResults, text: formatLogText(cleanedResults) }];
  });
}

function hasCompletedValue(value) {
  const text = String(value || "").trim();
  if (text === "+" || /^выполнен[ао]?$/i.test(text)) return true;
  return (text.match(/\d+(?:[.,]\d+)?/g) || [])
    .some((number) => Number(number.replace(",", ".")) > 0);
}

function isOnlyZeroText(value) {
  return /^\s*0+(?:[.,:]0+)*(?:\s*(?:с|сек(?:унд(?:а|ы)?)?|км|м|кг|мин(?:ут(?:а|ы)?)?|повт\.?|повтор(?:а|ов|ения|ений)?))?\s*$/i.test(String(value || ""));
}
