let nextDialogId = 0;

export function showProgramInputDialog({ title, label, value = "", placeholder = "", message = "", mark = "✎", confirmText = "Сохранить", returnFocus } = {}) {
  return new Promise((resolve) => {
    const id = ++nextDialogId;
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-program-input-dialog";
    dialog.setAttribute("aria-labelledby", `program-input-title-${id}`);
    if (message) dialog.setAttribute("aria-describedby", `program-input-message-${id}`);
    dialog.innerHTML = `
      <form class="vsg-sport-program-input-content" data-program-input-form>
        <div class="vsg-sport-program-dialog-head"><span class="vsg-sport-program-dialog-mark" aria-hidden="true">${escapeHtml(mark)}</span><div><span class="vsg-eyebrow">Программа</span><h2 id="program-input-title-${id}">${escapeHtml(title)}</h2></div></div>
        ${message ? `<p class="vsg-muted" id="program-input-message-${id}">${escapeHtml(message)}</p>` : ""}
        <label class="vsg-field">${escapeHtml(label)}<input class="vsg-input" data-program-input value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" autocomplete="off"></label>
        <div class="vsg-sport-program-dialog-actions"><button class="vsg-button" type="button" data-program-cancel>Отмена</button><button class="vsg-button vsg-button--primary" type="submit">${escapeHtml(confirmText)}</button></div>
      </form>
    `;
    let result = null;
    dialog.querySelector("[data-program-input-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      result = dialog.querySelector("[data-program-input]").value;
      dialog.close();
    });
    dialog.querySelector("[data-program-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      dialog.remove();
      previousFocus?.focus?.();
      resolve(result);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-program-input]").focus();
    dialog.querySelector("[data-program-input]").select();
  });
}

export function showProgramChoiceDialog({ title, message = "", choices = [], returnFocus } = {}) {
  return new Promise((resolve) => {
    const id = ++nextDialogId;
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-program-choice vsg-sport-program-choice-dialog";
    dialog.setAttribute("aria-labelledby", `program-choice-title-${id}`);
    if (message) dialog.setAttribute("aria-describedby", `program-choice-message-${id}`);
    dialog.innerHTML = `
      <div class="vsg-sport-program-dialog-head"><span class="vsg-sport-program-dialog-mark" aria-hidden="true">▦</span><div><span class="vsg-eyebrow">Программа</span><h2 id="program-choice-title-${id}">${escapeHtml(title)}</h2></div></div>
      ${message ? `<p class="vsg-muted" id="program-choice-message-${id}">${escapeHtml(message)}</p>` : ""}
      <div class="vsg-sport-program-template-list">${choices.map((choice, index) => `
        <button class="vsg-sport-program-template" type="button" data-choice-value="${escapeAttr(choice.value)}"><span class="vsg-sport-program-index">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(choice.label)}</strong>${choice.caption || choice.summary ? `<small>${escapeHtml([choice.caption, choice.summary].filter(Boolean).join(" · "))}</small>` : ""}</span><span aria-hidden="true">›</span></button>
      `).join("")}</div>
      <button class="vsg-button" type="button" data-choice-cancel>Отмена</button>
    `;
    let result = null;
    dialog.querySelectorAll("[data-choice-value]").forEach((button) => button.addEventListener("click", () => {
      result = button.dataset.choiceValue;
      dialog.close();
    }));
    dialog.querySelector("[data-choice-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      dialog.remove();
      previousFocus?.focus?.();
      resolve(result);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-choice-value]")?.focus();
  });
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
