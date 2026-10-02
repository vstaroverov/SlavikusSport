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
    const previousFocus = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-feedback-dialog";
    dialog.setAttribute("aria-labelledby", "celebration-title");
    dialog.innerHTML = `
      <div class="vsg-sport-feedback-content">
        <span class="vsg-sport-feedback-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 2 2.9 6.2 6.8.9-5 4.8 1.2 6.8-5.9-3.2-5.9 3.2 1.2-6.8-5-4.8 6.8-.9z"/></svg></span>
        <h2 id="celebration-title">${records.length ? "Новый рекорд!" : "Тренировка завершена!"}</h2>
        <p>${escapeHtml(praise)}</p>
        ${records.length ? `
          <div class="vsg-sport-feedback-records">
            ${records.slice(0, 3).map(renderRecord).join("")}
          </div>
        ` : ""}
        <p class="vsg-sport-feedback-note">${escapeHtml(motivation)}</p>
        <div class="vsg-sport-feedback-actions">
          <button class="vsg-button vsg-button--primary" type="button" data-celebration-ok>К логу</button>
        </div>
      </div>
    `;
    dialog.addEventListener("close", () => {
      dialog.remove();
      previousFocus?.focus?.();
      resolve(true);
    }, { once: true });
    dialog.querySelector("[data-celebration-ok]").addEventListener("click", () => dialog.close());
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-celebration-ok]").focus();
  });
}

function renderRecord(record) {
  const unit = record.type === "weight" ? "кг" : record.type === "distanceKm" ? "км" : record.type === "distanceM" ? "м" : record.type === "seconds" ? "с" : "повторов";
  const label = `${record.value} ${unit}`;
  const previous = record.previous > 0 ? `Было: ${record.previous}` : "Первый лучший результат";

  return `
    <div class="vsg-sport-feedback-record">
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
