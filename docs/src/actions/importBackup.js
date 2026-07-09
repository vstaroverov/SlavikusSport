import { importBackup } from "../features/storage/persistentStorage.js";

export default function importBackupAction() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const backup = JSON.parse(await file.text());
      await importBackup(backup);
      window.dispatchEvent(new Event("app:changed"));
      alert("Резервная копия восстановлена");
    } catch (error) {
      alert(error.message || "Не удалось восстановить резервную копию");
    }
  });

  input.click();
}
