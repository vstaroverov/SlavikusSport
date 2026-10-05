import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getNativePlugin } from "../src/features/share/platformPlugins.js";
import { getInviteTarget } from "../src/actions/inviteFriend.js";

test("Android share plugin is registered when the native bridge exposes it", () => {
  const previous = globalThis.window;
  const share = { share() {} };
  const calls = [];
  globalThis.window = { Capacitor: {
    getPlatform: () => "android",
    isPluginAvailable: (name) => name === "Share",
    Plugins: {},
    registerPlugin: (name) => { calls.push(name); return share; }
  } };
  try {
    assert.equal(getNativePlugin("Share"), share);
    assert.deepEqual(calls, ["Share"]);
    assert.equal(getNativePlugin("Filesystem"), null);
    globalThis.window.Capacitor.getPlatform = () => "web";
    assert.equal(getNativePlugin("Share"), null);
  } finally {
    globalThis.window = previous;
  }
});

test("invite links and local QR codes match Android and iPhone web installs", () => {
  const android = getInviteTarget("android");
  const web = getInviteTarget("web");
  assert.equal(android.url, "https://www.rustore.ru/catalog/app/ru.slavikus.sport");
  assert.equal(web.url, "https://vstaroverov.github.io/SlavikusSport/");
  assert.match(web.hint, /Safari/);
  assert.notEqual(android.qr, web.qr);
  const svg = readFileSync(new URL(`../design-system-v-star-group/assets/${web.qr}`, import.meta.url), "utf8");
  assert.match(svg, /<svg\b/);
  assert.ok(svg.includes(`<desc>${web.url}</desc>`));
});
