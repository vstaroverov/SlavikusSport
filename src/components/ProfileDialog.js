import { showSportFeedbackDialog } from "./SportFeedbackDialog.js";

export function showProfileDialog({ title, message = "", confirmText = "ОК", cancelText = "", danger = false, icon = danger ? "delete" : "backup", returnFocus } = {}) {
  return showSportFeedbackDialog({ title, message, confirmText, cancelText, tone: danger ? "danger" : "", icon, className: "vsg-sport-profile-dialog", returnFocus });
}

let nextChoiceId = 0;

export function showProfileChoiceDialog({ title, message = "", choices = [], cancelText = "Отмена", returnFocus } = {}) {
  return new Promise((resolve) => {
    const id = ++nextChoiceId;
    const previousFocus = returnFocus || document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "vsg vsg-sport-profile-choice-dialog";
    dialog.setAttribute("aria-labelledby", `profile-choice-title-${id}`);
    if (message) dialog.setAttribute("aria-describedby", `profile-choice-message-${id}`);
    dialog.innerHTML = `<div class="vsg-sport-profile-choice-content">
      <span class="vsg-eyebrow">Профиль</span>
      <h2 id="profile-choice-title-${id}">${escapeHtml(title)}</h2>
      ${message ? `<p id="profile-choice-message-${id}">${escapeHtml(message)}</p>` : ""}
      <div class="vsg-sport-profile-choice-list">${choices.map((choice, index) => `<button type="button" data-profile-choice="${index}"><strong>${escapeHtml(choice.label)}</strong>${choice.caption ? `<small>${escapeHtml(choice.caption)}</small>` : ""}</button>`).join("")}</div>
      <button class="vsg-button" type="button" data-profile-choice-cancel>${escapeHtml(cancelText)}</button>
    </div>`;
    dialog.querySelectorAll("[data-profile-choice]").forEach((button) => button.addEventListener("click", () => dialog.close(button.dataset.profileChoice)));
    dialog.querySelector("[data-profile-choice-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      const index = Number(dialog.returnValue);
      const result = dialog.returnValue === "" ? null : choices[index]?.value ?? null;
      dialog.remove();
      previousFocus?.focus?.();
      resolve(result);
    }, { once: true });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-profile-choice-cancel]").focus();
  });
}

function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
