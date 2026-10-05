export function formatDurationDigits(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(Boolean).join(":");
}

export function parseDurationInput(value) {
  const text = String(value || "").trim();
  const sixDigits = text.match(/^(\d{2})(\d{2})(\d{2})$/);
  const hoursMinutesSeconds = text.match(/^(\d{2}):([0-5]\d):([0-5]\d)$/);
  const legacyMinutesSeconds = text.match(/^(\d+):([0-5]\d)$/);
  const parts = sixDigits || hoursMinutesSeconds;
  if (parts) {
    const [, hours, minutes, seconds] = parts.map(Number);
    if (minutes >= 60 || seconds >= 60) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (legacyMinutesSeconds) return Number(legacyMinutesSeconds[1]) * 60 + Number(legacyMinutesSeconds[2]);
  return 0;
}

export function formatDurationForInput(value) {
  const total = typeof value === "number" ? value : parseDurationInput(value);
  if (!Number.isFinite(total) || total <= 0) return "";
  const seconds = Math.round(total);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 99) return "";
  return [hours, minutes, seconds % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatDurationInputElement(input) {
  const before = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
  input.value = formatDurationDigits(input.value);
  const position = positionAfterDigits(input.value, before);
  input.setSelectionRange?.(position, position);
}

export function handleDurationInputKeydown(event) {
  const input = event.target;
  if (event.key !== "Backspace" || input.selectionStart !== input.selectionEnd) return false;
  const position = input.selectionStart;
  if (position < 1 || input.value[position - 1] !== ":") return false;
  const digits = input.value.replace(/\D/g, "").split("");
  const digitIndex = input.value.slice(0, position - 1).replace(/\D/g, "").length - 1;
  if (digitIndex < 0) return false;
  digits.splice(digitIndex, 1);
  input.value = formatDurationDigits(digits.join(""));
  const next = positionAfterDigits(input.value, digitIndex);
  input.setSelectionRange?.(next, next);
  event.preventDefault();
  return true;
}

function positionAfterDigits(value, count) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < value.length; index++) {
    if (/\d/.test(value[index]) && ++seen === count) return index + 1;
  }
  return value.length;
}
