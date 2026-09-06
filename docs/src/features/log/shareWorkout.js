import { showConfirmDialog } from "../../components/ConfirmDialog.js";
import { formatLogTextWithRecords } from "./logExercises.js";

export async function shareWorkout(entry, entries = []) {
  const footer = "Трекинг создан в приложении SlavikusSport\n#спорт #тренировка #SlavikusSport";
  const workoutText = formatLogTextWithRecords(entry, entries) || entry.text || "";
  const text = `${entry.title}\n${entry.finishedAt}\nВремя: ${entry.duration}\n\n${workoutText}\n\n${footer}`;

  if (navigator.share) {
    await navigator.share({ title: entry.title, text });
    return;
  }

  await navigator.clipboard.writeText(text);
  await showConfirmDialog({
    title: "Скопировано",
    message: "Тренировка скопирована. Можно вставить в VK, MAX или Telegram.",
    confirmText: "ОК",
    cancelText: "",
    danger: false
  });
}
