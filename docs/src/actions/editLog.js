import { updateLogText } from "../features/log/logStorage.js";

export default function editLog(button) {
  const id = button.dataset.logId;
  const text = document.querySelector(`[data-log-text="${id}"]`);
  const editing = text.getAttribute("contenteditable") === "true";

  if (editing) {
    updateLogText(id, text.innerText.trim());
    text.setAttribute("contenteditable", "false");
    button.textContent = "Изменить";
    return;
  }

  text.setAttribute("contenteditable", "true");
  text.focus();
  button.textContent = "Сохранить";
}
