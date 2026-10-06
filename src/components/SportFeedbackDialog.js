let nextDialogId = 0;

const icons = {
  warning: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  backup: '<path d="M5 3h10l4 4v14H5zM15 3v5h4M12 11v7m-3-3 3 3 3-3"/>',
  delete: '<path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 10v7m4-7v7"/>'
};

export function showSportFeedbackDialog({ title, message, confirmText, cancelText = "", icon = "warning", tone = "", subjectTitle = "", subjectMeta = "", className = "", returnFocus }) {
  return new Promise((resolve) => {
    const id = ++nextDialogId;
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    const danger = tone === "danger";
    dialog.className = `vsg vsg-sport-feedback-dialog${danger ? " vsg-sport-feedback-dialog--danger" : ""}${className ? ` ${className}` : ""}`;
    if (danger) dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-labelledby", `sport-feedback-title-${id}`);
    dialog.setAttribute("aria-describedby", `sport-feedback-message-${id}`);
    dialog.innerHTML = `
      <form method="dialog" class="vsg-sport-feedback-content">
        <span class="vsg-sport-feedback-mark" ${danger ? 'data-tone="danger"' : icon === "warning" ? 'data-tone="warning"' : icon === "check" ? 'data-tone="success"' : ""} aria-hidden="true"><svg viewBox="0 0 24 24">${icons[icon] || icons.warning}</svg></span>
        <h2 id="sport-feedback-title-${id}"></h2>
        <p id="sport-feedback-message-${id}"></p>
        ${subjectTitle ? '<div class="vsg-sport-feedback-subject"><strong data-feedback-subject-title></strong><small data-feedback-subject-meta></small></div>' : ""}
        <div class="vsg-sport-feedback-actions">
          ${cancelText ? '<button class="vsg-button" value="cancel" type="submit" data-feedback-cancel></button>' : ""}
          <button class="vsg-button ${danger ? "vsg-button--danger" : "vsg-button--primary"}" value="confirm" type="submit" data-feedback-confirm></button>
        </div>
      </form>
    `;
    dialog.querySelector("h2").textContent = title;
    dialog.querySelector("p").textContent = message;
    if (subjectTitle) {
      dialog.querySelector("[data-feedback-subject-title]").textContent = subjectTitle;
      dialog.querySelector("[data-feedback-subject-meta]").textContent = subjectMeta;
    }
    dialog.querySelector("[data-feedback-confirm]").textContent = confirmText;
    if (cancelText) dialog.querySelector("[data-feedback-cancel]").textContent = cancelText;
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      const confirmed = dialog.returnValue === "confirm";
      dialog.remove();
      previousFocus?.focus?.();
      resolve(confirmed);
    }, { once: true });
    dialog.showModal();
    dialog.querySelector(cancelText ? "[data-feedback-cancel]" : "[data-feedback-confirm]").focus();
  });
}
