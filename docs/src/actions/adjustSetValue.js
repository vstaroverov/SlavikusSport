export default function adjustSetValue(button) {
  const input = button.closest(".current-card")?.querySelector("[data-set-value]");
  if (!input) return;

  const mode = button.dataset.mode;
  const step = Number(button.dataset.step || 0);
  const parsed = parseSetValue(input.value || input.placeholder);

  if (mode === "repeats") {
    parsed.repeats = Math.max(0, parsed.repeats + step);
  }

  if (mode === "weight") {
    if (!parsed.weight) return;
    parsed.weight = Math.max(0, parsed.weight + step);
  }

  input.value = formatSetValue(parsed);
  input.focus();
}

function parseSetValue(value) {
  const text = String(value || "").trim();
  const weighted = text.match(/(\d+(?:[.,]\d+)?)\s*[xх]\s*(\d+)/i);

  if (weighted) {
    return {
      weight: Number(weighted[1].replace(",", ".")) || 0,
      repeats: Number(weighted[2]) || 0
    };
  }

  return {
    weight: 0,
    repeats: Number(text.match(/\d+/)?.[0] || 0)
  };
}

function formatSetValue({ weight, repeats }) {
  if (weight > 0) return `${formatNumber(weight)}х${Math.round(repeats)}`;
  return String(Math.round(repeats));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}
