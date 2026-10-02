import { appStorage } from "../storage/persistentStorage.js";
import { getCurrentUser } from "../profile/profileStorage.js";
import { cleanZeroLogEntries } from "./logCleanup.js";

const LEGACY_LOG_KEY = "slavikus:log";
const LOG_KEY_PREFIX = "slavikus:log:";
const LOG_MIGRATION_KEY_PREFIX = "slavikus:log-migrated:";
const activeEdits = new Map();

export function getLogEntries() {
  migrateLegacyLogEntries();
  const stored = readEntries(getLogKey());
  const cleaned = cleanZeroLogEntries(stored, activeEdits);
  if (JSON.stringify(cleaned) !== JSON.stringify(stored)) {
    appStorage.setItem(getLogKey(), JSON.stringify(cleaned));
  }
  return sortEntriesByDateDesc(cleaned);
}

export function addLogEntry(entry) {
  const entries = getLogEntries();
  if (entry.draft) activeEdits.set(entry.id, null);
  entries.unshift(entry);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function updateLogText(id, text) {
  const entries = getLogEntries().map((entry) => entry.id === id ? { ...entry, text } : entry);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function updateLogDetails(id, details) {
  const entries = getLogEntries().map((entry) => entry.id === id ? { ...entry, ...details } : entry);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function beginLogEdit(id) {
  if (!activeEdits.has(id)) activeEdits.set(id, getLogEntry(id) || null);
}

export function finishLogEdit(id) {
  const entries = getLogEntries().map((entry) => entry.id === id ? { ...entry, draft: false } : entry);
  activeEdits.delete(id);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function discardLogDrafts() {
  if (!activeEdits.size) return;
  const entries = getLogEntries().flatMap((entry) => {
    if (!activeEdits.has(entry.id)) return [entry];
    const original = activeEdits.get(entry.id);
    return original ? [original] : [];
  });
  activeEdits.clear();
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function updateLogMedia(id, media) {
  const entries = getLogEntries().map((entry) => entry.id === id ? { ...entry, media } : entry);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function deleteLogEntry(id) {
  const entries = getLogEntries().filter((entry) => entry.id !== id);
  activeEdits.delete(id);
  appStorage.setItem(getLogKey(), JSON.stringify(entries));
}

export function clearLogEntries() {
  appStorage.setItem(getLogKey(), JSON.stringify([]));
}

export function getLogEntry(id) {
  return getLogEntries().find((entry) => entry.id === id);
}

export function seedDemoLogData() {
  if (appStorage.getItem(LEGACY_LOG_KEY)) return;

  const entries = getLogEntries();
  if (entries.some((entry) => String(entry.id).startsWith("demo-log-"))) return;

  const demoEntries = buildDemoMonthEntries();
  appStorage.setItem(getLogKey(), JSON.stringify([...demoEntries, ...entries]));
}

function getLogKey() {
  const user = getCurrentUser();
  return `${LOG_KEY_PREFIX}${encodeURIComponent(user?.id || "guest")}`;
}

function getMigrationKey() {
  const user = getCurrentUser();
  return `${LOG_MIGRATION_KEY_PREFIX}${encodeURIComponent(user?.id || "guest")}`;
}

function migrateLegacyLogEntries() {
  if (appStorage.getItem(getMigrationKey())) return;

  const legacyEntries = readEntries(LEGACY_LOG_KEY);
  if (legacyEntries.length) {
    const entriesById = new Map();
    [...legacyEntries, ...readEntries(getLogKey())].forEach((entry) => {
      entriesById.set(entry.id || `${entry.finishedAt}-${entry.title}`, entry);
    });
    appStorage.setItem(getLogKey(), JSON.stringify([...entriesById.values()]));
  }

  appStorage.setItem(getMigrationKey(), "true");
}

function readEntries(key) {
  try {
    const entries = JSON.parse(appStorage.getItem(key) || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function sortEntriesByDateDesc(entries) {
  return [...entries].sort((a, b) => (
    parseEntryDate(b.finishedAt) - parseEntryDate(a.finishedAt)
  ));
}

function parseEntryDate(value) {
  const match = String(value || "").match(/(\d{2})\.(\d{2})\.(\d{4}),?\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || 0)
    ).getTime();
  }

  const timestamp = new Date(value || "").getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildDemoMonthEntries() {
  const baseDate = new Date();
  const daysAgo = [28, 24, 21, 17, 14, 10, 7, 3, 0];

  return daysAgo.map((days, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - days);

    const squatWeight = 40 + index * 5;
    const legPressWeight = 90 + index * 5;
    const pullUps = 8 + Math.floor(index / 2);
    const press = 18 + index;

    const results = [
      {
        name: "Приседания со штангой",
        target: "12",
        weight: `${squatWeight} кг`,
        sets: 3,
        done: [String(10 + index), String(9 + index), String(8 + index)]
      },
      {
        name: "Жим ногами",
        target: "12",
        weight: `${legPressWeight} кг`,
        sets: 3,
        done: [String(12 + index), String(10 + index), String(8 + index)]
      },
      {
        name: "Подтягивания",
        target: "макс",
        weight: "",
        sets: 3,
        done: [String(pullUps), String(Math.max(1, pullUps - 1)), String(Math.max(1, pullUps - 2))]
      },
      {
        name: "Пресс",
        target: "20",
        weight: "",
        sets: 3,
        done: [String(press), String(press), String(press - 1)]
      }
    ];

    return {
      id: `demo-log-${index + 1}`,
      title: index % 2 === 0 ? "Фулл боди" : "День ног",
      finishedAt: date.toLocaleString("ru-RU"),
      duration: `01:${String(5 + index).padStart(2, "0")}:20`,
      text: buildDemoText(results),
      results
    };
  }).reverse();
}

function buildDemoText(results) {
  return results.map((result) => {
    const weight = result.weight ? ` (${result.weight})` : "";
    return `${result.name}${weight}: ${result.done.join(" / ")}`;
  }).join("\n");
}
