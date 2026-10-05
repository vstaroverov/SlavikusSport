import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "rustore-assets", "screenshots");
const profile = await mkdtemp(join(tmpdir(), "slavikus-store-"));
const browser = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"
], { stdio: "ignore" });

let socket;
let nextId = 0;
const pending = new Map();

const slides = [
  { file: "01-main.png", route: "main", label: "ТВОЙ РИТМ", first: "Тренируйся", accent: "по своему плану", detail: "План, тренировка и быстрые действия на одном экране." },
  { file: "02-program.png", route: "program", label: "ПРОГРАММА", first: "Планируй", accent: "каждый день", detail: "Собирай тренировки и назначай их в календаре." },
  { file: "03-workout.png", route: "workout", label: "ТРЕНИРОВКА", first: "Начинай", accent: "и записывай", detail: "Таймер, подходы и результат во время занятия." },
  { file: "04-log.png", route: "log", label: "ИСТОРИЯ", first: "Сохраняй", accent: "результаты", detail: "Все выполненные тренировки в удобном логе." },
  { file: "05-stats.png", route: "stats", label: "ПРОГРЕСС", first: "Замечай", accent: "свой рост", detail: "Повторения и динамика веса на графиках." },
  { file: "06-exercises.png", route: "exercises", label: "УПРАЖНЕНИЯ", first: "Настрой", accent: "под себя", detail: "Свои упражнения, категории и единицы измерения." },
  { file: "07-profile.png", route: "profile", label: "ТВОИ ДАННЫЕ", first: "Сохрани", accent: "свой прогресс", detail: "Резервная копия и восстановление из файла." }
];
const requestedSlide = process.argv[2];
if (requestedSlide && !slides.some((slide) => slide.file === requestedSlide)) {
  throw new Error(`Unknown screenshot: ${requestedSlide}`);
}

try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = Number((await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); break; }
    catch { await new Promise((done) => setTimeout(done, 100)); }
  }
  if (!port) throw new Error("Chrome DevTools did not start");
  const pages = await (await fetch(`http://localhost:${port}/json/list`)).json();
  socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const { done, fail } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? fail(new Error(message.error.message)) : done(message.result);
  });
  const call = (method, params = {}) => new Promise((done, fail) => {
    const id = ++nextId;
    pending.set(id, { done, fail });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await call("Page.enable");
  await call("Page.addScriptToEvaluateOnNewDocument", { source: `
    if (location.hostname === "localhost") {
      const day = new Date();
      const iso = new Date(day.getTime() - day.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const workouts = [
        { id: "promo-legs", title: "День ног", shortName: "Т1", exercises: [
          { name: "Присед со штангой", measure: "weighted", target: "8", weight: "60", sets: 4 },
          { name: "Толкание платформы лежа", measure: "weighted", target: "12", weight: "100", sets: 3 },
          { name: "Вис", measure: "seconds", target: "45", weight: "", sets: 2 },
          { name: "Заминка", measure: "completion", target: "", weight: "", sets: 1 }
        ] },
        { id: "promo-run", title: "Пробежка", shortName: "Т2", exercises: [
          { name: "Бег", measure: "distanceKm", target: "10", time: "37:12", weight: "", sets: 1 }
        ] },
        { id: "promo-body", title: "Верх тела", shortName: "Т3", exercises: [
          { name: "Подтягивания с весом", measure: "weighted", target: "8", weight: "10", sets: 3 },
          { name: "Отжимания", measure: "repeats", target: "20", weight: "", sets: 3 }
        ] }
      ];
      const log = Array.from({ length: 5 }, (_, index) => ({
        id: "promo-log-" + index,
        title: index === 0 ? "День ног" : index === 1 ? "Пробежка" : "Силовая тренировка",
        finishedAt: new Date(day.getTime() - (index + 1) * 7 * 86400000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        duration: "00:" + String(45 + index * 2).padStart(2, "0") + ":00",
        text: "",
        results: index === 1 ? [
          { name: "Бег", measure: "distanceKm", target: "10", weight: "", sets: 1, done: ["10"], weights: [""], times: [2232] }
        ] : [
          { name: "Присед со штангой", measure: "weighted", target: "8", weight: String(60 - index * 2.5), sets: 3, done: ["8", "8", "7"], weights: [String(60 - index * 2.5), String(60 - index * 2.5), String(60 - index * 2.5)] },
          { name: "Подтягивания", measure: "repeats", target: "10", weight: "", sets: 3, done: ["10", "9", "8"], weights: ["", "", ""] }
        ]
      }));
      localStorage.setItem("slavikus:user", JSON.stringify({ id: "promo", name: "Славка", gender: "male" }));
      localStorage.setItem("slavikus:reset-0.016.2", "true");
      localStorage.setItem("slavikus:workouts", JSON.stringify(workouts));
      localStorage.setItem("slavikus:calendar:promo", JSON.stringify({ [iso]: "promo-legs" }));
      localStorage.setItem("slavikus:calendar-migrated:promo", "true");
      localStorage.setItem("slavikus:log:promo", JSON.stringify(log));
      localStorage.setItem("slavikus:log-migrated:promo", "true");
    }
  ` });
  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await call("Page.navigate", { url: "http://localhost:4173/#/main" });
  await waitUntil(async () => evaluate("!!document.querySelector('.phone-shell')"));

  const logo = (await readFile(join(root, "design-system-v-star-group", "assets", "slavikus-sport-logo.svg"))).toString("base64");
  const font = (await readFile(join(root, "design-system-v-star-group", "assets", "fonts", "Manrope-variable.ttf"))).toString("base64");

  for (const [index, slide] of slides.entries()) {
    if (requestedSlide && slide.file !== requestedSlide) continue;
    await call("Page.navigate", { url: `http://localhost:4173/#/${slide.route}` });
    await waitUntil(async () => evaluate(`document.querySelector('.phone-shell')?.innerText.includes(${JSON.stringify(slide.route === "main" ? "День ног" : slide.route === "exercises" ? "Упражнения" : slide.route === "stats" ? "Стата" : slide.route === "profile" ? "Профиль" : slide.route === "workout" ? "День ног" : slide.route === "log" ? "Лог" : "Программа")})`));
    if (slide.route === "workout") {
      await evaluate("document.querySelector('[data-action=\"startWorkout\"]')?.click(); true");
      await waitUntil(async () => evaluate(`(async () => !!(await import('/src/features/workout/workoutTimer.js')).getActiveSession())()`));
      await evaluate(`(async () => { const timer = await import('/src/features/workout/workoutTimer.js'); const session = timer.getActiveSession(); session.startedAt = Date.now() - 18 * 60000; timer.saveActiveSession(session); window.dispatchEvent(new CustomEvent('app:changed')); return true; })()`);
      await new Promise((done) => setTimeout(done, 350));
    }
    if (slide.route === "stats") {
      await evaluate(`(async () => { const { appStorage } = await import('/src/features/storage/persistentStorage.js'); const entries = JSON.parse(appStorage.getItem('slavikus:log:promo')); appStorage.setItem('slavikus:log:promo', JSON.stringify(entries.filter((entry) => entry.results.some((result) => result.name === 'Присед со штангой')).map((entry) => ({ ...entry, results: entry.results.filter((result) => result.name === 'Присед со штангой') })))); window.dispatchEvent(new CustomEvent('app:changed')); return true; })()`);
      await new Promise((done) => setTimeout(done, 300));
    }
    const screen = (await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })).data;
    const html = renderSlide(slide, index + 1, screen, logo, font);
    await call("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
    await call("Page.navigate", { url: `data:text/html;base64,${Buffer.from(html).toString("base64")}` });
    await waitUntil(async () => evaluate("document.querySelector('.screen-image')?.complete && document.fonts.status === 'loaded'"));
    const png = Buffer.from((await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })).data, "base64");
    await writeFile(join(output, slide.file), png);
    console.log(`${slide.file}: ${png.length} bytes`);
    await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  }
  if (!requestedSlide) {
    for (const old of ["01-login.png", "02-main.png", "03-workout.png", "04-program.png", "05-log.png", "06-stats.png", "07-profile.png"]) {
      if (!slides.some((slide) => slide.file === old)) await rm(join(output, old), { force: true });
    }
  }
} finally {
  socket?.close();
  browser.kill();
  const allowedRoot = resolve(tmpdir()) + sep;
  if (!resolve(profile).startsWith(allowedRoot) || !profile.includes("slavikus-store-")) throw new Error(`Unsafe profile path: ${profile}`);
  for (let attempt = 0; attempt < 10; attempt++) {
    try { await rm(profile, { recursive: true, force: true }); break; }
    catch { await new Promise((done) => setTimeout(done, 200)); }
  }
}

async function waitUntil(check) {
  for (let i = 0; i < 60; i++) {
    if (await check()) return;
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error("Timed out waiting for page");
}

function renderSlide(slide, number, screen, logo, font) {
  const safe = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
    @font-face{font-family:Manrope;src:url(data:font/ttf;base64,${font}) format('truetype');font-weight:100 900}
    *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:hidden}
    body{font-family:Manrope,Arial,sans-serif;background:#061014;color:#f4f8f8;position:relative}
    body:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 89% 20%,#1d3a25 0,transparent 32%),radial-gradient(circle at 0% 84%,#102c31 0,transparent 36%),linear-gradient(145deg,#061014,#0a1b1c 60%,#061014)}
    body:after{content:"";position:absolute;inset:0;opacity:.17;background-image:linear-gradient(#d8ff18 1px,transparent 1px),linear-gradient(90deg,#d8ff18 1px,transparent 1px);background-size:88px 88px;mask-image:linear-gradient(to bottom,black,transparent 70%)}
    .content{position:relative;z-index:1;height:100%;padding:64px 68px}
    .brand{display:flex;align-items:center;gap:18px;color:#f4f8f8;font-size:27px;font-weight:800;letter-spacing:.01em}
    .brand img{width:58px;height:58px;border-radius:14px}
    .num{margin-left:auto;color:#b7c9c8;font-size:22px;letter-spacing:.1em;font-weight:700}
    .label{margin-top:70px;color:#d8ff18;font-size:25px;letter-spacing:.16em;font-weight:900}
    h1{margin:10px 0 0;font-size:83px;line-height:1.02;letter-spacing:-.055em;font-weight:850}
    h1 em{display:block;color:#d8ff18;font-style:normal}
    .detail{margin:20px 0 0;max-width:900px;color:#b8c8ca;font-size:27px;line-height:1.28;font-weight:600}
    .phone{position:absolute;left:198px;top:468px;width:684px;height:1452px;padding:12px;border:2px solid #436467;border-radius:54px;background:#0b1f22;box-shadow:0 42px 105px #000a,0 0 0 1px #d8ff1822;overflow:hidden}
    .screen-image{width:100%;height:100%;display:block;object-fit:cover;border-radius:40px}
  </style></head><body><div class="content">
    <div class="brand"><img src="data:image/svg+xml;base64,${logo}"><span>Slavikus Sport</span><span class="num">${String(number).padStart(2, "0")} / 07</span></div>
    <div class="label">${safe(slide.label)}</div>
    <h1>${safe(slide.first)}<em>${safe(slide.accent)}</em></h1>
    <p class="detail">${safe(slide.detail)}</p>
    <div class="phone"><img class="screen-image" src="data:image/png;base64,${screen}"></div>
  </div></body></html>`;
}
