import test from "node:test";
import assert from "node:assert/strict";
import { getNativePlugin } from "../src/features/share/platformPlugins.js";

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
