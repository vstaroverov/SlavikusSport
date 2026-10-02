import test from "node:test";
import assert from "node:assert/strict";
import shareLog from "../src/actions/shareLog.js";
import { shareWorkout } from "../src/features/log/shareWorkout.js";

const entry = {
  id: "share-1", title: "Пробежка", finishedAt: "02.10.2026, 18:00", duration: "00:30:00",
  results: [{ name: "Бег", measure: "distanceKm", done: ["5"], times: [1800], sets: 1 }]
};

test("Android shares the log text through the native menu", async () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  let payload;
  globalThis.window = { Capacitor: {
    getPlatform: () => "android",
    isPluginAvailable: () => true,
    Plugins: { Share: { share: async (value) => { payload = value; } } }
  } };
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { share: () => { throw new Error("Web Share used on Android"); } } });
  try {
    assert.equal(await shareWorkout(entry, [entry]), "shared");
    assert.equal(payload.title, "Пробежка");
    assert.match(payload.text, /Бег 5 км за 30:00 ★/);
  } finally {
    globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});

test("Android attaches the saved photo to the log share", async () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  let written;
  let shared;
  globalThis.window = { Capacitor: {
    getPlatform: () => "android",
    isPluginAvailable: () => true,
    Plugins: {
      Filesystem: { writeFile: async (options) => { written = options; return { uri: "file:///cache/photo.png" }; } },
      Share: { share: async (options) => { shared = options; } }
    }
  } };
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  try {
    const withPhoto = { ...entry, media: { name: "photo.png", type: "image/png", data: "data:image/png;base64,aGVsbG8=" } };
    assert.equal(await shareWorkout(withPhoto, [withPhoto]), "shared");
    assert.equal(written.directory, "CACHE");
    assert.equal(written.data, "aGVsbG8=");
    assert.match(written.path, /\.png$/);
    assert.deepEqual(shared.files, ["file:///cache/photo.png"]);
    assert.match(shared.text, /SlavikusSport/);
  } finally {
    globalThis.window = previousWindow;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});

test("web share sends the photo file alongside the log text", async () => {
  const previousWindow = globalThis.window;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const previousFile = globalThis.File;
  let shared;
  globalThis.window = { Capacitor: null };
  globalThis.File = class {
    constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options.type; }
  };
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {
    canShare: ({ files }) => files.length === 1,
    share: async (options) => { shared = options; }
  } });
  try {
    const withPhoto = { ...entry, media: { name: "photo.png", type: "image/png", data: "data:image/png;base64,aGVsbG8=" } };
    assert.equal(await shareWorkout(withPhoto, [withPhoto]), "shared");
    assert.equal(shared.files[0].name, "slavikus-log.png");
    assert.equal(shared.files[0].type, "image/png");
    assert.match(shared.text, /SlavikusSport/);
  } finally {
    globalThis.window = previousWindow;
    globalThis.File = previousFile;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});

test("log share dialog previews records and offers copy when system sharing is unavailable", async () => {
  const previousStorage = globalThis.localStorage;
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  values.set("slavikus:user", JSON.stringify({ id: "share-dialog" }));
  values.set("slavikus:log:share-dialog", JSON.stringify([entry]));
  globalThis.window = { Capacitor: null };
  let copied = "";
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: { writeText: async (value) => { copied = value; } } } });
  let dialog;
  let restoredFocus = 0;
  globalThis.document = {
    body: { append(value) { dialog = value; } },
    createElement() {
      const elements = new Map();
      const element = (selector) => {
        if (!elements.has(selector)) elements.set(selector, {
          addEventListener(event, callback) { if (event === "click") this.onClick = callback; },
          focus() {}, select() {}
        });
        return elements.get(selector);
      };
      return {
        querySelector: element,
        setAttribute() {},
        addEventListener(event, callback) { if (event === "close") this.onClose = callback; },
        showModal() { this.open = true; },
        close() { this.open = false; this.onClose(); },
        remove() {}
      };
    }
  };
  try {
    shareLog({ dataset: { logId: "share-1" }, focus() { restoredFocus += 1; } });
    assert.match(dialog.className, /vsg-sport-log-share-dialog/);
    assert.match(dialog.innerHTML, /data-log-share-send hidden/);
    assert.match(dialog.querySelector("[data-log-share-preview]").value, /Бег 5 км за 30:00 ★/);
    await dialog.querySelector("[data-log-share-copy]").onClick();
    assert.match(copied, /Бег 5 км за 30:00 ★/);
    assert.match(dialog.querySelector("[role=status]").textContent, /скопирован/);
    dialog.close();
    assert.equal(restoredFocus, 1);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});
