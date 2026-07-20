import { downloadBackupFile } from "../features/storage/backupFiles.js";

export default async function exportBackupAction(button) {
  const shell = button?.closest?.(".phone-shell");
  const scrollTop = shell?.scrollTop ?? 0;

  await downloadBackupFile();

  requestAnimationFrame(() => {
    const nextShell = document.querySelector(".phone-shell");
    if (nextShell) nextShell.scrollTop = scrollTop;
  });
}
