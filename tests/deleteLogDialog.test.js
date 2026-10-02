import test from "node:test";
import assert from "node:assert/strict";
import deleteLog from "../src/actions/deleteLog.js";
import { getLogEntry } from "../src/features/log/logStorage.js";

test("delete log dialog shows the chosen record and deletes only after confirmation", async () => {
  const previousStorage = globalThis.localStorage;
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  values.set("slavikus:user", JSON.stringify({ id: "delete-design" }));
  values.set("slavikus:log:delete-design", JSON.stringify([{
    id: "log-1", title: "Бег <вечер>", finishedAt: "02.10.2026, 19:00", duration: "00:30:00",
    results: [{ name: "Бег", measure: "distanceKm", done: ["5"], times: [1800], sets: 1 }]
  }]));
  let lastDialog;
  let cancelFocused = 0;
  let headingFocused = 0;
  let changes = 0;
  const button = { dataset: { logId: "log-1" }, focus() {} };
  globalThis.document = {
    activeElement: button,
    body: { append(dialog) { lastDialog = dialog; } },
    querySelector(selector) {
      return selector === "#sport-log-title" ? { setAttribute() {}, focus() { headingFocused += 1; } } : null;
    },
    createElement() {
      const elements = new Map();
      const element = (selector) => {
        if (!elements.has(selector)) elements.set(selector, { textContent: "", focus() { if (selector === "[data-feedback-cancel]") cancelFocused += 1; } });
        return elements.get(selector);
      };
      return {
        attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        querySelector: element,
        addEventListener(event, callback) { if (event === "close") this.onClose = callback; },
        showModal() {},
        close(value) { this.returnValue = value; this.onClose(); },
        remove() {}
      };
    }
  };
  globalThis.window = { dispatchEvent() { changes += 1; } };
  try {
    const cancelled = deleteLog(button);
    assert.match(lastDialog.className, /vsg-sport-feedback-dialog--danger/);
    assert.equal(lastDialog.attributes.role, "alertdialog");
    assert.equal(lastDialog.querySelector("[data-feedback-subject-title]").textContent, "Бег <вечер>");
    assert.match(lastDialog.querySelector("[data-feedback-subject-meta]").textContent, /02\.10\.2026, 19:00/);
    assert.equal(cancelFocused, 1);
    lastDialog.close("cancel");
    await cancelled;
    assert.ok(getLogEntry("log-1"));
    assert.equal(changes, 0);

    const confirmed = deleteLog(button);
    lastDialog.close("confirm");
    await confirmed;
    assert.equal(getLogEntry("log-1"), undefined);
    assert.equal(changes, 1);
    assert.equal(headingFocused, 1);
  } finally {
    globalThis.localStorage = previousStorage;
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});
