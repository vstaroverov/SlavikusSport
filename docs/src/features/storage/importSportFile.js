import { importSharedWorkouts } from "../program/workoutSharing.js";
import { getBackupSummaryText } from "./backupFiles.js";
import { importBackup } from "./persistentStorage.js";

export async function importSportFile(text) {
  let document;
  try {
    document = JSON.parse(text);
  } catch {
    throw new Error("Файл не является корректным JSON.");
  }

  if (document?.kind === "workout-share") {
    return { kind: "workout-share", count: importSharedWorkouts(text) };
  }

  const restored = await importBackup(document);
  return { kind: "backup", summary: getBackupSummaryText(restored) };
}
