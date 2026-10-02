import test from "node:test";
import assert from "node:assert/strict";
import { renderHeader } from "../src/components/Header.js";
import { renderBottomNav } from "../src/components/BottomNav.js";
import { renderMainScreen } from "../src/screens/MainScreen.js";
import { todayIso } from "../src/features/program/calendarPlanner.js";
import { renderProgramScreen } from "../src/screens/ProgramScreen.js";
import { renderExercisesScreen } from "../src/screens/ExercisesScreen.js";
import { updateExercise } from "../src/features/program/programStorage.js";

test("home shell uses design-system components and keeps route actions", () => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  try {
    const header = renderHeader({ plan: "<plan>" });
    assert.match(header, /vsg-sport-app-header/);
    assert.match(header, /assets\/slavikus-sport-logo\.svg/);
    assert.match(header, /data-route="profile"/);
    assert.match(header, /vsg-sport-profile-trigger/);
    assert.match(header, /slavikus-sport-crown\.svg/);
    assert.match(header, /&lt;plan&gt;/);

    const footer = renderBottomNav("main");
    assert.match(footer, /vsg-sport-bottom-nav/);
    assert.match(footer, /data-route="main" aria-current="page"/);
    assert.equal((footer.match(/aria-current="page"/g) || []).length, 1);

    const rest = renderMainScreen();
    assert.match(rest, /vsg-sport-today-card/);
    assert.match(rest, /День отдыха/);
    assert.match(rest, /data-route="program">Открыть программу/);
    assert.match(rest, /<h2 id="sport-coach-title">Тренер<\/h2>/);
    assert.match(rest, /data-action="inviteFriend"/);
    assert.match(rest, /data-action="shareTraining"/);

    values.set("slavikus:calendar:guest", JSON.stringify({ [todayIso()]: "workout-test" }));
    values.set("slavikus:workouts", JSON.stringify([{
      id: "workout-test",
      title: "<Бег>",
      exercises: [{ name: "Бег", measure: "distanceKm", target: "10", time: "37:12", sets: 1 }]
    }]));
    const planned = renderMainScreen();
    assert.match(planned, /&lt;Бег&gt;/);
    assert.match(planned, /10 км · 37:12 мин/);
    assert.doesNotMatch(planned, /1 упражнение · 1 подход/);
    assert.match(planned, /data-route="workout">Начать тренировку/);

    values.set("slavikus:program-edit", "true");
    values.set("slavikus:program-active-workout", "workout-test");
    const editor = renderProgramScreen();
    assert.match(editor, /vsg-sport-program-screen/);
    assert.match(editor, /vsg-sport-program-card/);
    assert.match(editor, /vsg-sport-program-exercise/);
    assert.match(editor, /vsg-sport-program-calendar/);
    for (const action of ["addWorkout", "addWorkoutTemplate", "toggleProgramEdit", "saveWorkoutEditor", "assignWorkout"]) {
      assert.match(editor, new RegExp(`data-action="${action}"`));
    }
    assert.match(editor, /aria-pressed="true">Готово/);
    assert.match(editor, /Расстояние, км/);
    assert.match(editor, /Плановое время, мм:сс/);
    assert.doesNotMatch(editor, /data-field="weight"/);
    assert.doesNotMatch(editor, /data-field="sets"/);
    assert.match(renderExercisesScreen(), /км · время/);

    updateExercise("workout-test", 0, "time", "40:05");
    assert.match(renderMainScreen(), /10 км · 40:05 мин/);
  } finally {
    globalThis.localStorage = previous;
  }
});
