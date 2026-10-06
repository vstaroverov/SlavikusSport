let nextDialogId = 0;

export function chooseBackupFile({ title, message, returnFocus } = {}) {
  return new Promise((resolve) => {
    const id = ++nextDialogId;
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-feedback-dialog vsg-sport-profile-dialog vsg-sport-backup-file-dialog";
    dialog.setAttribute("aria-labelledby", `backup-file-title-${id}`);
    dialog.setAttribute("aria-describedby", `backup-file-message-${id}`);
    dialog.innerHTML = `<div class="vsg-sport-feedback-content">
      <span class="vsg-sport-feedback-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5zM15 3v5h4M12 11v7m-3-3 3 3 3-3"/></svg></span>
      <h2 id="backup-file-title-${id}"></h2>
      <p id="backup-file-message-${id}"></p>
      <div class="vsg-sport-feedback-actions">
        <label class="vsg-button vsg-button--primary vsg-sport-backup-file-picker">Выбрать файл<input type="file" accept=".json,application/json" aria-label="Выбрать JSON-файл"></label>
        <button class="vsg-button" type="button" data-backup-file-cancel>Отмена</button>
      </div>
    </div>`;
    dialog.querySelector("h2").textContent = title;
    dialog.querySelector("p").textContent = message;
    let selectedFile = null;
    dialog.querySelector('input[type="file"]').addEventListener("change", (event) => {
      selectedFile = event.target.files?.[0] || null;
      if (selectedFile) dialog.close();
    });
    dialog.querySelector("[data-backup-file-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      dialog.remove();
      previousFocus?.focus?.();
      resolve(selectedFile);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-backup-file-cancel]").focus();
  });
}
