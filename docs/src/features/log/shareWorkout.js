import { getNativePlugin } from "../share/platformPlugins.js";
import { formatLogTextWithRecords } from "./logExercises.js";

export function buildWorkoutShareText(entry, entries = []) {
  const footer = "Трекинг создан в приложении SlavikusSport\n#спорт #тренировка #SlavikusSport";
  const workoutText = formatLogTextWithRecords(entry, entries) || entry.text || "";
  return `${entry.title}\n${entry.finishedAt}\nВремя: ${entry.duration}\n\n${workoutText}\n\n${footer}`;
}

export function canShareWorkout() {
  const nativeShare = typeof window !== "undefined" ? getNativePlugin("Share") : null;
  return Boolean(nativeShare?.share || (typeof navigator !== "undefined" && navigator.share));
}

export async function shareWorkout(entry, entries = []) {
  const text = buildWorkoutShareText(entry, entries);
  const nativeShare = typeof window !== "undefined" ? getNativePlugin("Share") : null;
  const media = getShareMedia(entry.media);
  if (entry.media && !media) throw new Error("Не удалось прочитать прикреплённое фото или видео.");
  if (nativeShare?.share) {
    const options = { title: entry.title, text, dialogTitle: "Поделиться записью" };
    if (media) {
      const filesystem = getNativePlugin("Filesystem");
      if (!filesystem?.writeFile) throw new Error("Не удалось подготовить фото или видео для отправки.");
      const path = `slavikus-log-${Date.now()}.${media.extension}`;
      const { uri } = await filesystem.writeFile({ path, data: media.base64, directory: "CACHE" });
      options.files = [uri];
    }
    await nativeShare.share(options);
    return "shared";
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    const options = { title: entry.title, text };
    if (media) {
      if (typeof File !== "function") throw unsupportedMediaError();
      const blob = await (await fetch(entry.media.data)).blob();
      const file = new File([blob], `slavikus-log.${media.extension}`, { type: media.type });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) throw unsupportedMediaError();
      options.files = [file];
    }
    try {
      await navigator.share(options);
    } catch (error) {
      if (media && error?.name === "TypeError") throw unsupportedMediaError();
      throw error;
    }
    return "shared";
  }

  if (media) throw unsupportedMediaError();
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) throw new Error("Отправка недоступна. Скопируй текст записи.");
  await navigator.clipboard.writeText(text);
  return "copied";
}

function getShareMedia(media) {
  const match = /^data:(image\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(media?.data || "");
  if (!match) return null;
  const type = match[1].toLowerCase();
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/heic": "heic", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" })[type]
    || media.name?.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase()
    || "bin";
  return { type, extension, base64: match[2] };
}

function unsupportedMediaError() {
  return new Error("Этот браузер не поддерживает отправку фото или видео. Сохрани файл и отправь его отдельно; текст можно скопировать здесь.");
}
