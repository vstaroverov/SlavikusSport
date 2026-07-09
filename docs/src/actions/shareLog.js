import { getLogEntry } from "../features/log/logStorage.js";
import { shareWorkout } from "../features/log/shareWorkout.js";

export default async function shareLog(button) {
  const entry = getLogEntry(button.dataset.logId);
  if (entry) await shareWorkout(entry);
}
