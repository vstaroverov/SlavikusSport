import { getNativePlugin } from "../features/share/platformPlugins.js";

const ANDROID_APP_URL = "https://www.rustore.ru/catalog/app/ru.slavikus.sport";
const WEB_APP_URL = "https://vstaroverov.github.io/SlavikusSport/";
let currentDialog = null;

export function getInviteTarget(platform) {
  return platform === "android"
    ? {
        url: ANDROID_APP_URL,
        qr: "slavikus-sport-invite-qr.svg",
        alt: "QR-код ссылки на Slavikus Sport в RuStore",
        hint: "Открой ссылку, чтобы установить приложение из RuStore."
      }
    : {
        url: WEB_APP_URL,
        qr: "slavikus-sport-invite-web-qr.svg",
        alt: "QR-код ссылки на веб-приложение Slavikus Sport",
        hint: "На iPhone открой ссылку в Safari и выбери «Поделиться» → «На экран Домой»."
      };
}

export default function inviteFriend(trigger) {
  currentDialog?.close();
  let platform = globalThis.window?.Capacitor?.getPlatform?.() === "android" ? "android" : "web";
  let target = getInviteTarget(platform);
  const dialog = document.createElement("dialog");
  currentDialog = dialog;
  dialog.className = "vsg vsg-sport-invite-dialog";
  dialog.setAttribute("aria-labelledby", "sport-invite-title");
  dialog.innerHTML = `
    <h2 id="sport-invite-title">Пригласить друга</h2>
    <p class="vsg-muted">Выбери устройство друга и покажи QR-код.</p>
    <div class="vsg-sport-invite-platforms" role="group" aria-label="Устройство друга">
      <button class="vsg-button" type="button" data-invite-platform="android" aria-pressed="${platform === "android"}">Android</button>
      <button class="vsg-button" type="button" data-invite-platform="web" aria-pressed="${platform === "web"}">iPhone</button>
    </div>
    <img class="vsg-sport-invite-qr" src="./design-system-v-star-group/assets/${target.qr}" alt="${target.alt}" width="280" height="280">
    <a class="vsg-sport-invite-link" href="${target.url}" target="_blank" rel="noopener noreferrer">${target.url}</a>
    <p class="vsg-muted" data-invite-hint>${target.hint}</p>
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
  dialog.querySelectorAll("[data-invite-platform]").forEach((button) => {
    button.addEventListener("click", () => {
      platform = button.dataset.invitePlatform;
      target = getInviteTarget(platform);
      dialog.querySelectorAll("[data-invite-platform]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option.dataset.invitePlatform === platform));
      });
      const qr = dialog.querySelector(".vsg-sport-invite-qr");
      qr.src = `./design-system-v-star-group/assets/${target.qr}`;
      qr.alt = target.alt;
      const link = dialog.querySelector(".vsg-sport-invite-link");
      link.href = target.url;
      link.textContent = target.url;
      dialog.querySelector("[data-invite-hint]").textContent = target.hint;
      dialog.querySelector("[role=status]").textContent = "";
    });
  });
  dialog.querySelector("[data-invite-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-invite-copy]").addEventListener("click", () => copyLink(dialog, target.url));
  dialog.querySelector("[data-invite-share]").addEventListener("click", async () => {
    const status = dialog.querySelector("[role=status]");
    status.textContent = "";
    try {
      const nativeShare = getNativePlugin("Share");
      if (nativeShare?.share) {
        await nativeShare.share({ title: "Slavikus Sport", text: "Тренируйся со мной в Slavikus Sport", url: target.url, dialogTitle: "Отправить ссылку" });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Slavikus Sport", text: "Тренируйся со мной в Slavikus Sport", url: target.url });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }

    await copyLink(dialog, target.url);
  });
  dialog.showModal();
}

async function copyLink(dialog, url) {
  const status = dialog.querySelector("[role=status]");
  try {
    await navigator.clipboard.writeText(url);
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
