import { deleteLogEntry, getLogEntry } from "../features/log/logStorage.js";
import { showSportFeedbackDialog } from "../components/SportFeedbackDialog.js";

export default async function deleteLog(button) {
  const entry = getLogEntry(button.dataset.logId);
  if (!entry) return;

  const confirmed = await showSportFeedbackDialog({
    title: "Удалить запись?",
    message: "Запись и её результаты будут удалены из лога. Это действие нельзя отменить.",
    subjectTitle: entry.title,
    subjectMeta: [entry.finishedAt, entry.duration].filter(Boolean).join(" · "),
    confirmText: "Удалить запись",
    cancelText: "Отмена",
    icon: "delete",
    tone: "danger",
    returnFocus: button
  });
  if (!confirmed) return;

  deleteLogEntry(entry.id);
  window.dispatchEvent(new CustomEvent("app:changed"));
  const heading = document.querySelector("#sport-log-title");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus();
}
