import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatDurationDigits, formatDurationForInput, formatDurationInputElement, handleDurationInputKeydown, parseDurationInput } from "../src/features/workout/durationInput.js";
import { formatPlannedActivity } from "../src/features/program/plannedActivity.js";
import { APP_VERSION, getAppPlatform } from "../src/app/version.js";

test("six numeric taps become hours, minutes and seconds without typing colons", () => {
  const input = {
    value: "003712",
    selectionStart: 6,
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  };
  formatDurationInputElement(input);
  assert.equal(input.value, "00:37:12");
  assert.equal(input.selectionStart, 8);
  assert.equal(parseDurationInput(input.value), 2232);
  assert.equal(parseDurationInput("013005"), 5405);
  assert.equal(formatDurationDigits("01:30:05"), "01:30:05");
  assert.equal(parseDurationInput("00:60:00"), 0);
  assert.equal(parseDurationInput("00:01:60"), 0);
  assert.equal(parseDurationInput("000160"), 0);
});

test("backspace at an inserted separator removes a digit", () => {
  const input = {
    value: "00:37:12", selectionStart: 3, selectionEnd: 3,
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  };
  let prevented = false;
  assert.equal(handleDurationInputKeydown({ target: input, key: "Backspace", preventDefault() { prevented = true; } }), true);
  assert.equal(input.value, "03:71:2");
  assert.equal(prevented, true);
});

test("old minute-second plans and log seconds display in the new input format", () => {
  assert.equal(parseDurationInput("37:12"), 2232);
  assert.equal(formatDurationForInput("37:12"), "00:37:12");
  assert.equal(formatDurationForInput(5405), "01:30:05");
  assert.equal(formatPlannedActivity({ measure: "distanceKm", target: "10", time: "37:12" }), "10 км · 00:37:12");
});

test("profile platform labels and release number match the native builds", () => {
  assert.equal(getAppPlatform({ getPlatform: () => "android" }), "Android");
  assert.equal(getAppPlatform({ getPlatform: () => "ios" }), "iOS");
  assert.equal(getAppPlatform(null), "Веб-приложение");
  assert.equal(APP_VERSION, "2.001.1");
  assert.match(readFileSync(new URL("../android/app/build.gradle", import.meta.url), "utf8"), /versionCode 200101\s+versionName "2\.001\.1"/);
  assert.match(readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8"), /MARKETING_VERSION = 2\.001\.1;/);
});
