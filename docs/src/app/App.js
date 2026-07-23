import { getRoute, navigate } from "./routes.js";
import { getCurrentUser } from "../features/profile/profileStorage.js";
import { renderVkLogin } from "../auth/VkLogin.js";
import { renderHeader } from "../components/Header.js";
import { renderBottomNav } from "../components/BottomNav.js";
import { renderMainScreen } from "../screens/MainScreen.js";
import { renderWorkoutScreen } from "../screens/WorkoutScreen.js";
import { renderProgramScreen } from "../screens/ProgramScreen.js";
import { renderLogScreen } from "../screens/LogScreen.js";
import { renderStatsScreen } from "../screens/StatsScreen.js";
import { renderExercisesScreen } from "../screens/ExercisesScreen.js";
import { renderInfoScreen } from "../screens/InfoScreen.js";
import { renderProfileScreen } from "../screens/ProfileScreen.js";
import { seedInitialData } from "../features/program/programStorage.js";
import { formatSeconds, getActiveSession, getElapsedSeconds, getRestRemainingSeconds } from "../features/workout/workoutTimer.js";
import { applyAppMigration } from "../features/storage/appMigration.js";

const screens = {
  main: renderMainScreen,
  workout: renderWorkoutScreen,
  program: renderProgramScreen,
  log: renderLogScreen,
  stats: renderStatsScreen,
  exercises: renderExercisesScreen,
  info: renderInfoScreen,
  profile: renderProfileScreen
};

export function createApp(root) {
  seedInitialData();

  const render = () => {
    const user = applyAppMigration(getCurrentUser());
    if (!user) {
      root.innerHTML = renderVkLogin();
      bindGlobalActions(root);
      return;
    }

    const route = getRoute();
    const screen = screens[route] || screens.main;
    root.innerHTML = `
      <div class="phone-shell">
        ${renderHeader(user)}
        <main class="screen">${screen()}</main>
        ${renderBottomNav(route)}
      </div>
    `;
    bindGlobalActions(root);
  };

  window.addEventListener("hashchange", render);
  window.addEventListener("app:changed", render);
  window.setInterval(() => {
    const timer = root.querySelector("[data-timer]");
    const restTimer = root.querySelector("[data-rest-timer]");
    const session = getActiveSession();
    if (timer && session) timer.textContent = formatSeconds(getElapsedSeconds(session));
    if (restTimer && session) restTimer.textContent = formatSeconds(getRestRemainingSeconds(session));
  }, 1000);
  render();
}

function bindGlobalActions(root) {
  if (root.dataset.boundGlobalActions) return;
  root.dataset.boundGlobalActions = "true";

  root.addEventListener("click", async (event) => {
    const routeElement = event.target.closest("[data-route]");
    if (routeElement && root.contains(routeElement)) {
      navigate(routeElement.dataset.route);
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement || !root.contains(actionElement)) return;

    const module = await import(`../actions/${actionElement.dataset.action}.js`);
    module.default(actionElement);
  });

  root.addEventListener("change", (event) => {
    runChangeAction(root, event.target);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runChangeAction(root, event.target);
  });
}

async function runChangeAction(root, element) {
  if (!element?.dataset?.change || !root.contains(element)) return;

  const module = await import(`../actions/${element.dataset.change}.js`);
  module.default(element);
}
