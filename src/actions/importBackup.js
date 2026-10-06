import { importSportFile } from "../features/storage/importSportFile.js";
import { showProfileDialog } from "../components/ProfileDialog.js";
import { chooseBackupFile } from "../components/BackupFileDialog.js";

export default async function importBackupAction(trigger) {
  const file = await chooseBackupFile({
    title: "Восстановить копию",
    message: "Выбери JSON-файл Slavikus Sport. Полная копия заменит данные приложения, файл тренировок добавит их в программу.",
    returnFocus: trigger
  });
  if (!file) return;
  try {
    const result = await importSportFile(await file.text());
    window.dispatchEvent(new Event("app:changed"));
    await showProfileDialog({
      title: result.kind === "workout-share" ? "Тренировки добавлены" : "Готово",
      message: result.kind === "workout-share"
        ? `Загружено: ${result.count}. Твоя программа и история сохранены.`
        : `Файл с параметрами загружен.\n\n${result.summary}`,
      confirmText: "ОК",
      cancelText: "",
      danger: false
    });
  } catch (error) {
    await showProfileDialog({
      title: "Ошибка",
      message: error.message || "Не удалось восстановить резервную копию.",
      confirmText: "ОК",
      cancelText: "",
      danger: true,
      icon: "warning"
    });
  }
}
