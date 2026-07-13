let activeDialog = null;

export function showConfirmDialog({
  title = "Подтвердить действие",
  message = "",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = true
} = {}) {
  if (activeDialog) activeDialog.close(false);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="confirm-mark ${danger ? "danger" : ""}">!</div>
        <h2 id="confirm-title">${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="confirm-actions">
          <button class="secondary-button" data-confirm-cancel>${escapeHtml(cancelText)}</button>
          <button class="primary-button ${danger ? "danger-confirm" : ""}" data-confirm-ok>${escapeHtml(confirmText)}</button>
        </div>
      </section>
    `;

    const close = (result) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      activeDialog = null;
      resolve(result);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close(false);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(false);
    });
    overlay.querySelector("[data-confirm-cancel]").addEventListener("click", () => close(false));
    overlay.querySelector("[data-confirm-ok]").addEventListener("click", () => close(true));
    document.addEventListener("keydown", onKeyDown);
    document.body.append(overlay);
    overlay.querySelector("[data-confirm-ok]").focus();

    activeDialog = { close };
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
