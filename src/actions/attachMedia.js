import { updateLogMedia } from "../features/log/logStorage.js";

export default function attachMedia(input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    updateLogMedia(input.dataset.logId, {
      name: file.name,
      type: file.type,
      data: reader.result
    });
    window.dispatchEvent(new CustomEvent("app:changed"));
  });
  reader.readAsDataURL(file);
}
