export function showDownloadedFileDialog(fileName, returnFocus) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-download-dialog";
    dialog.setAttribute("aria-labelledby", "sport-download-title");
    dialog.setAttribute("aria-describedby", "sport-download-help");
    dialog.innerHTML = `
      <span class="vsg-sport-download-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg></span>
      <h2 id="sport-download-title">Файл скачан</h2>
      <p id="sport-download-help">Найди файл в папке «Загрузки» и отправь его другу удобным способом.</p>
      <strong class="vsg-sport-download-file"></strong>
      <button class="vsg-button vsg-button--primary" type="button">Понятно</button>
    `;
    dialog.querySelector(".vsg-sport-download-file").textContent = fileName;
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      dialog.remove();
      returnFocus?.focus();
      resolve();
    }, { once: true });
    dialog.querySelector("button").addEventListener("click", () => dialog.close());
    dialog.showModal();
    dialog.querySelector("button").focus();
  });
}
