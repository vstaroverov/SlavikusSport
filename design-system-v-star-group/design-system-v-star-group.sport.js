const monthLabel = document.querySelector("#sport-month-label");
const daysRoot = document.querySelector("#sport-calendar-days");
const selection = document.querySelector("#sport-calendar-selection");
const demoStatus = document.querySelector("#sport-demo-status");
function showDemoMessage(message) {
  document.querySelector("#sport-demo-text").textContent = message;
  demoStatus.hidden = false;
}
document.querySelector("#sport-demo-close").addEventListener("click", () => { demoStatus.hidden = true; });
document.querySelectorAll(".vsg-sport-bottom-nav a").forEach((link) => link.addEventListener("click", () => {
  document.querySelectorAll(".vsg-sport-bottom-nav a").forEach((item) => item.removeAttribute("aria-current"));
  link.setAttribute("aria-current", "page");
}));
const today = new Date();
today.setHours(12, 0, 0, 0);
let month = new Date(today.getFullYear(), today.getMonth(), 1);
let selected = new Date(today);

function iso(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function renderCalendar() {
  monthLabel.textContent = month.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  daysRoot.replaceChildren();
  const offset = (month.getDay() + 6) % 7;
  for (let index = 0; index < offset; index++) daysRoot.append(document.createElement("span"));
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= count; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const planned = day === 2 || day === 5 || day === 8;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.date = iso(date);
    button.setAttribute("aria-label", `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}${planned ? ", силовая тренировка" : ", день отдыха"}`);
    button.setAttribute("aria-pressed", String(iso(date) === iso(selected)));
    if (iso(date) === iso(today)) button.dataset.today = "";
    if (planned) button.dataset.planned = "";
    const number = document.createElement("span");
    number.textContent = String(day);
    const caption = document.createElement("small");
    caption.textContent = planned ? "Силовая" : "";
    button.append(number, caption);
    daysRoot.append(button);
  }
  selection.textContent = `Выбрано: ${selected.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}. ${[2, 5, 8].includes(selected.getDate()) ? "Силовая тренировка." : "День отдыха."}`;
}

document.querySelector("#sport-prev-month").addEventListener("click", () => {
  month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  selected = new Date(month);
  renderCalendar();
});
document.querySelector("#sport-next-month").addEventListener("click", () => {
  month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  selected = new Date(month);
  renderCalendar();
});
daysRoot.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-date]");
  if (!button) return;
  const [year, monthNumber, day] = button.dataset.date.split("-").map(Number);
  selected = new Date(year, monthNumber - 1, day);
  renderCalendar();
  daysRoot.querySelector(`[data-date="${button.dataset.date}"]`)?.focus();
});
renderCalendar();

let elapsed = 0;
let running = false;
let lastTick = 0;
const timer = document.querySelector("#sport-timer");
const toggle = document.querySelector("#sport-timer-toggle");
const sessionStatus = document.querySelector("#sport-session-status");
function renderTimer() {
  const seconds = Math.floor(elapsed / 1000);
  timer.textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((number) => String(number).padStart(2, "0")).join(":");
  toggle.textContent = running ? "Пауза" : elapsed ? "Продолжить" : "Начать";
  sessionStatus.textContent = running ? "Идёт тренировка" : elapsed ? "Пауза" : "Ожидание";
  sessionStatus.className = running ? "vsg-badge vsg-badge--success" : elapsed ? "vsg-badge vsg-badge--paused" : "vsg-badge";
}
toggle.addEventListener("click", () => {
  running = !running;
  lastTick = performance.now();
  renderTimer();
});
setInterval(() => {
  if (!running) return;
  const now = performance.now();
  elapsed += now - lastTick;
  lastTick = now;
  renderTimer();
}, 250);

let setsDone = 0;
function advanceSet(skipped) {
  if (setsDone >= 3) return;
  setsDone++;
  document.querySelector("#sport-set-progress").value = setsDone;
  document.querySelector("#sport-set-count").textContent = setsDone === 3 ? "Все подходы закрыты" : `Подход ${setsDone + 1} из 3`;
  document.querySelector("#sport-set-result").textContent = `${skipped ? "Подход пропущен." : "Подход выполнен."} Закрыто: ${setsDone} из 3. ${setsDone === 3 ? "Упражнение завершено." : "Отдых: 01:00."}`;
  if (setsDone === 3) {
    document.querySelector("#sport-complete-set").disabled = true;
    document.querySelector("#sport-skip-set").disabled = true;
  }
}
document.querySelector("#sport-complete-set").addEventListener("click", () => advanceSet(false));
document.querySelector("#sport-skip-set").addEventListener("click", () => advanceSet(true));

const editDialog = document.querySelector("#sport-exercise-dialog");
const editTrigger = document.querySelector("#sport-edit-exercise");
editTrigger.addEventListener("click", () => { editDialog.returnValue = ""; editDialog.showModal(); });
editDialog.addEventListener("close", () => {
  editTrigger.focus();
  if (editDialog.returnValue === "save") showDemoMessage("Демо: изменения упражнения не сохраняются.");
});
const programDialog = document.querySelector("#sport-program-dialog");
const programTrigger = document.querySelector("#sport-edit-program");
programTrigger.addEventListener("click", () => { programDialog.returnValue = ""; programDialog.showModal(); });
programDialog.addEventListener("close", () => {
  programTrigger.focus();
  if (programDialog.returnValue === "save") showDemoMessage("Демо: программа не изменяется.");
});
const celebrationDialog = document.querySelector("#sport-celebration-dialog");
const celebrationTrigger = document.querySelector("#sport-show-celebration");
celebrationTrigger.addEventListener("click", () => { celebrationDialog.returnValue = ""; celebrationDialog.showModal(); });
celebrationDialog.addEventListener("close", () => celebrationTrigger.focus());
for (const [triggerId, dialogId] of [["sport-show-distance-error", "sport-distance-error-dialog"], ["sport-show-backup-dialog", "sport-backup-dialog"]]) {
  const trigger = document.getElementById(triggerId);
  const dialog = document.getElementById(dialogId);
  trigger.addEventListener("click", () => { dialog.returnValue = ""; dialog.showModal(); });
  dialog.addEventListener("close", () => trigger.focus());
}
const clearLogDialog = document.querySelector("#sport-clear-log-dialog");
const deleteLogDialog = document.querySelector("#sport-delete-log-dialog");
const deleteLogTrigger = document.querySelector("#sport-delete-log-trigger");
deleteLogTrigger.addEventListener("click", () => { deleteLogDialog.returnValue = ""; deleteLogDialog.showModal(); });
deleteLogDialog.addEventListener("close", () => {
  deleteLogTrigger.focus();
  if (deleteLogDialog.returnValue === "delete") showDemoMessage("Демо: запись не удалена.");
});
const shareLogDialog = document.querySelector("#sport-share-log-dialog");
const shareLogTrigger = document.querySelector("#sport-share-log-trigger");
shareLogTrigger.addEventListener("click", () => { shareLogDialog.returnValue = ""; shareLogDialog.showModal(); });
document.querySelector("#sport-share-log-close").addEventListener("click", () => shareLogDialog.close());
shareLogDialog.addEventListener("close", () => shareLogTrigger.focus());
const clearLogTrigger = document.querySelector("#sport-clear-log");
clearLogTrigger.addEventListener("click", () => { clearLogDialog.returnValue = ""; clearLogDialog.showModal(); });
clearLogDialog.addEventListener("close", () => {
  clearLogTrigger.focus();
  if (clearLogDialog.returnValue === "clear") showDemoMessage("Демо: лог не удалён.");
});
document.querySelectorAll("[data-demo-message]").forEach((button) => button.addEventListener("click", () => {
  showDemoMessage(button.dataset.demoMessage);
}));
