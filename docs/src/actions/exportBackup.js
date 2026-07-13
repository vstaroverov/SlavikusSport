import { downloadBackupFile } from "../features/storage/backupFiles.js";

export default async function exportBackupAction() {
  await downloadBackupFile();
}
