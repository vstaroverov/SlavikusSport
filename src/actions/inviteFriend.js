import { getNativePlugin } from "../features/share/platformPlugins.js";

const APP_URL = "https://www.rustore.ru/catalog/app/ru.slavikus.sport";
let currentDialog = null;

export default function inviteFriend(trigger) {
  currentDialog?.close();
  const dialog = document.createElement("dialog");
  currentDialog = dialog;
  dialog.className = "vsg vsg-sport-invite-dialog";
  dialog.setAttribute("aria-labelledby", "sport-invite-title");
  dialog.innerHTML = `
    <h2 id="sport-invite-title">Пригласить друга</h2>
    <p class="vsg-muted">Покажи QR-код другу для установки приложения.</p>
    <img class="vsg-sport-invite-qr" src="./design-system-v-star-group/assets/slavikus-sport-invite-qr.svg" alt="QR-код ссылки на Slavikus Sport в RuStore" width="280" height="280">
    <a class="vsg-sport-invite-link" href="${APP_URL}" target="_blank" rel="noopener noreferrer">${APP_URL}</a>
    <div class="vsg-sport-invite-actions">
      <button class="vsg-button vsg-button--primary" type="button" data-invite-share>Поделиться ссылкой</button>
      <button class="vsg-button" type="button" data-invite-copy>Скопировать ссылку</button>
      <button class="vsg-button" type="button" data-invite-close>Закрыть</button>
    </div>
    <p class="vsg-sport-invite-status" role="status" aria-live="polite"></p>
  `;
  document.body.append(dialog);
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (currentDialog === dialog) currentDialog = null;
    trigger?.focus();
  }, { once: true });
  dialog.querySelector("[data-invite-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-invite-copy]").addEventListener("click", () => copyLink(dialog));
  dialog.querySelector("[data-invite-share]").addEventListener("click", async () => {
    const status = dialog.querySelector("[role=status]");
    status.textContent = "";
    try {
      const nativeShare = getNativePlugin("Share");
      if (nativeShare?.share) {
        await nativeShare.share({ title: "Slavikus Sport", text: "Тренируйся со мной в Slavikus Sport", url: APP_URL, dialogTitle: "Отправить ссылку" });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Slavikus Sport", text: "Тренируйся со мной в Slavikus Sport", url: APP_URL });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }

    await copyLink(dialog);
  });
  dialog.showModal();
}

async function copyLink(dialog) {
  const status = dialog.querySelector("[role=status]");
  try {
    await navigator.clipboard.writeText(APP_URL);
    status.textContent = "Ссылка скопирована. Отправь её другу удобным способом.";
  } catch {
    const link = dialog.querySelector(".vsg-sport-invite-link");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(link);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Ссылка выделена. Скопируй её через меню браузера.";
  }
}
