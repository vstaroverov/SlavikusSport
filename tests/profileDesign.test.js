import test from "node:test";
import assert from "node:assert/strict";
import { renderProfileScreen } from "../src/screens/ProfileScreen.js";

test("profile screen keeps all actions and shows backup freshness in design-system cards", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
  globalThis.window = { Capacitor: { getPlatform: () => "android" } };
  memory.set("slavikus:user", JSON.stringify({ id: "profile-design", name: "Спортсмен" }));
  const html = renderProfileScreen();
  assert.match(html, /vsg-sport-profile-screen/);
  assert.match(html, /Копии нет/);
  assert.match(html, /<span>Платформа<\/span><strong>Android<\/strong>/);
  assert.match(html, /<span>Версия<\/span><strong>2\.001\.1<\/strong>/);
  for (const action of ["saveProfileLogin", "exportBackup", "checkBackup", "importBackup", "clearLog", "checkUpdate", "logout"]) {
    assert.match(html, new RegExp(`data-action="${action}"`));
  }
  assert.match(html, /vsg-button--danger[^>]*data-action="clearLog"/);
});
