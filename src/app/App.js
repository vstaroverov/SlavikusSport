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
import { formatSeconds, getActiveSession, getElapsedSeconds } from "../features/workout/workoutTimer.js";

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
    const user = getCurrentUser();
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
    const session = getActiveSession();
    if (timer && session) timer.textContent = formatSeconds(getElapsedSeconds(session));
  }, 1000);
  render();
}

function bindGlobalActions(root) {
  root.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => navigate(element.dataset.route));
  });

  root.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", async () => {
      const module = await import(`../actions/${element.dataset.action}.js`);
      module.default(element);
    });
  });

  root.querySelectorAll("[data-change]").forEach((element) => {
    element.addEventListener("change", async () => {
      const module = await import(`../actions/${element.dataset.change}.js`);
      module.default(element);
    });
  });
}
