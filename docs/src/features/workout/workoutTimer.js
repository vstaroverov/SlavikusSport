const SESSION_KEY = "slavikus:active-workout";

export function getActiveSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function saveActiveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function formatSeconds(total) {
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function getElapsedSeconds(session) {
  if (!session) return 0;
  const running = session.running ? Math.floor((Date.now() - session.startedAt) / 1000) : 0;
  return session.elapsed + running;
}

export function getRestRemainingSeconds(session) {
  if (!session?.restStartedAt || !session?.restDuration) return 0;

  const passed = Math.floor((Date.now() - session.restStartedAt) / 1000);
  return Math.max(0, Number(session.restDuration) - passed);
}
