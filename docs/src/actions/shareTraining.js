import { showConfirmDialog } from "../components/ConfirmDialog.js";
import { getWorkouts } from "../features/program/programStorage.js";
import { createWorkoutShare, importSharedWorkouts, MAX_SHARE_FILE_BYTES } from "../features/program/workoutSharing.js";
import { getNativePlugin } from "../features/share/platformPlugins.js";
import { showDownloadedFileDialog } from "../components/DownloadedFileDialog.js";

let currentDialog = null;

export default function shareTraining(trigger) {
  currentDialog?.close();
  const workouts = getWorkouts();
  const dialog = document.createElement("dialog");
  currentDialog = dialog;
  dialog.className = "vsg vsg-sport-share-dialog";
  dialog.setAttribute("aria-labelledby", "sport-share-title");
  dialog.innerHTML = `
    <h2 id="sport-share-title">Поделиться тренировкой</h2>
    <p class="vsg-muted">Выбери тренировки для отправки файлом.</p>
    <div class="vsg-sport-share-list">
      ${workouts.length ? workouts.map((workout, index) => `<label><input type="checkbox" value="${index}"><span>${escapeHtml(workout.shortName || `Т${index + 1}`)}. ${escapeHtml(workout.title)}</span></label>`).join("") : '<p class="vsg-muted">Пока нет тренировок для отправки.</p>'}
    </div>
    <div class="vsg-sport-share-actions">
      <button type="button" class="vsg-button vsg-button--primary" data-share-send disabled>Отправить</button>
      <button type="button" class="vsg-button" data-share-import>Загрузить полученный файл</button>
      <button type="button" class="vsg-button" data-share-close>Отмена</button>
    </div>
  `;
  document.body.append(dialog);
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (currentDialog === dialog) currentDialog = null;
    if (!document.querySelector("dialog[open]")) trigger?.focus();
  }, { once: true });
  dialog.querySelector("[data-share-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-share-import]").addEventListener("click", () => openFilePicker(dialog));
  dialog.addEventListener("change", () => {
    dialog.querySelector("[data-share-send]").disabled = !dialog.querySelector("input:checked");
  });
  dialog.querySelector("[data-share-send]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const ids = [...dialog.querySelectorAll("input:checked")].map((input) => workouts[Number(input.value)].id);
      const data = createWorkoutShare(workouts, ids);
      const result = await sendFile(JSON.stringify(data, null, 2));
      if (result) dialog.close();
      if (result.status === "downloaded") await showDownloadedFileDialog(result.fileName, trigger);
    } catch (error) {
      if (error?.name !== "AbortError") {
        dialog.close();
        await showConfirmDialog({ title: "Не удалось отправить", message: error.message || "Попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
      }
    } finally {
      if (dialog.open) button.disabled = !dialog.querySelector("input:checked");
    }
  });
  dialog.showModal();
}

async function sendFile(text) {
  const name = `slavikus-trenirovki-${new Date().toISOString().slice(0, 10)}.json`;
  const filesystem = getNativePlugin("Filesystem");
  const share = getNativePlugin("Share");
  if (window.Capacitor?.getPlatform?.() === "android") {
    if (!filesystem?.writeFile || !share?.share) throw new Error("Отправка файла недоступна в этой версии Android-приложения.");
    const { uri } = await filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8" });
    await share.share({ title: "Тренировки Slavikus Sport", files: [uri], dialogTitle: "Отправить тренировки" });
    return { status: "shared", fileName: name };
  }
  const file = typeof File === "function" ? new File([text], name, { type: "application/json" }) : null;
  if (file && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    try {
      await navigator.share({ title: "Тренировки Slavikus Sport", files: [file] });
      return { status: "shared", fileName: name };
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      // Browser supports text sharing but may reject JSON attachments.
    }
  }
  const url = URL.createObjectURL(file || new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { status: "downloaded", fileName: name };
}

function openFilePicker(dialog) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.hidden = true;
  document.body.append(input);
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    dialog.close();
    try {
      if (file.size > MAX_SHARE_FILE_BYTES) throw new Error("Файл слишком большой.");
      const count = importSharedWorkouts(await file.text());
      window.dispatchEvent(new Event("app:changed"));
      await showConfirmDialog({ title: "Тренировки добавлены", message: `Загружено: ${count}. Твоя программа и история сохранены.`, confirmText: "ОК", cancelText: "", danger: false });
    } catch (error) {
      await showConfirmDialog({ title: "Не удалось загрузить", message: error.message || "Проверь файл и попробуй ещё раз.", confirmText: "ОК", cancelText: "", danger: false });
    }
  }, { once: true });
  input.click();
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
