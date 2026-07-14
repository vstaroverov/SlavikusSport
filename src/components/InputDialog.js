export function showInputDialog({
  title = "Ввод",
  label = "",
  value = "",
  placeholder = "",
  confirmText = "Сохранить",
  cancelText = "Отмена",
  multiline = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog log-add-dialog" role="dialog" aria-modal="true" aria-labelledby="input-dialog-title">
        <div class="confirm-mark">+</div>
        <h2 id="input-dialog-title">${escapeHtml(title)}</h2>
        <label>
          <span>${escapeHtml(label)}</span>
          ${multiline
            ? `<textarea data-dialog-input rows="8" placeholder="${escapeAttr(placeholder)}">${escapeHtml(value)}</textarea>`
            : `<input data-dialog-input value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" />`
          }
        </label>
        <div class="confirm-actions">
          <button class="secondary-button" data-dialog-cancel>${escapeHtml(cancelText)}</button>
          <button class="primary-button" data-dialog-ok>${escapeHtml(confirmText)}</button>
        </div>
      </section>
    `;

    const input = overlay.querySelector("[data-dialog-input]");
    const close = (result) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(result);
    };
    const submit = () => close(input.value);
    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
      if (event.key === "Enter" && !multiline) submit();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-dialog-cancel]").addEventListener("click", () => close(null));
    overlay.querySelector("[data-dialog-ok]").addEventListener("click", submit);
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    input.focus();
    input.select?.();
  });
}

export function showChoiceDialog({
  title = "Выбор",
  message = "",
  choices = [],
  cancelText = "Отмена"
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog calendar-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="choice-dialog-title">
        <div class="confirm-mark">+</div>
        <h2 id="choice-dialog-title">${escapeHtml(title)}</h2>
        ${message ? `<p>${escapeHtml(message)}</p>` : ""}
        <div class="calendar-choice-list">
          ${choices.map((choice) => `
            <button class="secondary-button" data-choice-value="${escapeAttr(choice.value)}">
              <strong>${escapeHtml(choice.label)}</strong>
              ${choice.caption ? `<span>${escapeHtml(choice.caption)}</span>` : ""}
            </button>
          `).join("")}
        </div>
        <div class="confirm-actions single">
          <button class="secondary-button" data-choice-cancel>${escapeHtml(cancelText)}</button>
        </div>
      </section>
    `;

    const close = (result) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(result);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close(null);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector("[data-choice-cancel]").addEventListener("click", () => close(null));
    overlay.querySelectorAll("[data-choice-value]").forEach((button) => {
      button.addEventListener("click", () => close(button.dataset.choiceValue));
    });
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-choice-value]")?.focus();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
