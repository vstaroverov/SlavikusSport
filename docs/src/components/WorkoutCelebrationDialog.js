import { getWorkoutRecords } from "../features/log/logExercises.js";

const praiseLines = [
  "Ты молодец. Сегодня тренировка вышла отлично.",
  "Сильная работа. Каждый подход добавил форму и уверенность.",
  "Отличный темп. Такая дисциплина и делает прогресс заметным.",
  "Хорошая тренировка. Ты снова сделал шаг вперед."
];

const motivationLines = [
  "Результат любит тех, кто приходит снова.",
  "Сила растет там, где есть регулярность.",
  "Сегодняшняя работа станет завтрашним запасом.",
  "Не обязательно идеально. Важно продолжать."
];

export function showWorkoutCelebrationDialog(entry, entries = []) {
  const records = getWorkoutRecords(entry, entries);
  const praise = pickLine(praiseLines, entry.id);
  const motivation = pickLine(motivationLines, `${entry.id}-motivation`);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog workout-celebration-dialog" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
        <div class="celebration-trophy" aria-hidden="true">🏆</div>
        <h2 id="celebration-title">${records.length ? "Новый рекорд!" : "Тренировка завершена!"}</h2>
        <p>${escapeHtml(praise)}</p>
        ${records.length ? `
          <div class="celebration-records">
            ${records.slice(0, 3).map(renderRecord).join("")}
          </div>
        ` : ""}
        <p class="celebration-quote">${escapeHtml(motivation)}</p>
        <div class="confirm-actions single">
          <button class="primary-button" data-celebration-ok>К логу</button>
        </div>
      </section>
    `;

    const close = () => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(true);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "Enter") close();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector("[data-celebration-ok]").addEventListener("click", close);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-celebration-ok]").focus();
  });
}

function renderRecord(record) {
  const label = record.type === "weight" ? `${record.value} кг` : `${record.value} повторов`;
  const previous = record.previous > 0 ? `Было: ${record.previous}` : "Первый лучший результат";

  return `
    <div class="celebration-record">
      <strong>${escapeHtml(record.name)}</strong>
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(previous)}</small>
    </div>
  `;
}

function pickLine(lines, seed) {
  const text = String(seed || "");
  const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return lines[total % lines.length];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
