import { getLogEntries, getLogEntry } from "../features/log/logStorage.js";
import { buildWorkoutShareText, canShareWorkout, shareWorkout } from "../features/log/shareWorkout.js";

let currentDialog = null;

export default function shareLog(trigger) {
  const entry = getLogEntry(trigger.dataset.logId);
  if (!entry) return;
  const entries = getLogEntries();
  const text = buildWorkoutShareText(entry, entries);
  const canShare = canShareWorkout();
  currentDialog?.close();

  const dialog = document.createElement("dialog");
  currentDialog = dialog;
  dialog.className = "vsg vsg-sport-log-share-dialog";
  dialog.setAttribute("aria-labelledby", "sport-log-share-title");
  dialog.setAttribute("aria-describedby", "sport-log-share-description");
  dialog.innerHTML = `
    <div class="vsg-sport-log-share-content">
      <div class="vsg-sport-log-share-head">
        <span class="vsg-sport-log-share-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 11 16-7-6 16-3-7-7-2Zm7 2 9-9"/></svg></span>
        <div><span class="vsg-eyebrow">Лог тренировок</span><h2 id="sport-log-share-title">Поделиться записью</h2></div>
      </div>
      <p class="vsg-sport-log-share-copy" id="sport-log-share-description">Проверь текст перед отправкой. Личные рекорды отмечены звёздочкой.${entry.media ? ` ${entry.media.type?.startsWith("video/") ? "Видео" : "Фото"} будет прикреплено к сообщению.` : ""}</p>
      <label class="vsg-field">Текст сообщения<textarea class="vsg-input vsg-sport-log-share-preview" readonly data-log-share-preview></textarea></label>
      <div class="vsg-sport-log-share-actions">
        <button class="vsg-button vsg-button--primary" type="button" data-log-share-send ${canShare ? "" : "hidden"}>Поделиться</button>
        <button class="vsg-button ${canShare ? "" : "vsg-button--primary"}" type="button" data-log-share-copy>Скопировать текст</button>
        <button class="vsg-button" type="button" data-log-share-close>Отмена</button>
      </div>
      <p class="vsg-sport-log-share-status" role="status" aria-live="polite"></p>
    </div>
  `;
  const preview = dialog.querySelector("[data-log-share-preview]");
  const status = dialog.querySelector("[role=status]");
  const sendButton = dialog.querySelector("[data-log-share-send]");
  const copyButton = dialog.querySelector("[data-log-share-copy]");
  preview.value = text;

  dialog.addEventListener("close", () => {
    dialog.remove();
    if (currentDialog === dialog) currentDialog = null;
    trigger.focus();
  }, { once: true });
  dialog.querySelector("[data-log-share-close]").addEventListener("click", () => dialog.close());
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Текст скопирован. Вставь его в сообщение.";
    } catch {
      preview.focus();
      preview.select();
      status.textContent = "Текст выделен. Скопируй его через меню браузера.";
    }
  });
  sendButton.addEventListener("click", async () => {
    sendButton.disabled = true;
    status.textContent = "";
    try {
      const result = await shareWorkout(entry, entries);
      if (result === "shared") dialog.close();
      else status.textContent = "Текст скопирован. Вставь его в сообщение.";
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = error?.message || "Не удалось отправить запись.";
    } finally {
      if (dialog.open) sendButton.disabled = false;
    }
  });
  document.body.append(dialog);
  dialog.showModal();
  (canShare ? sendButton : copyButton).focus();
}
