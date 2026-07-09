export function renderWorkoutLogCard(entry) {
  return `
    <article class="log-card">
      <label class="media-slot">
        ${renderMedia(entry.media)}
        <input type="file" accept="image/*,video/*" data-change="attachMedia" data-log-id="${entry.id}" />
      </label>
      <div class="log-card-head">
        <div>
          <strong>${entry.title}</strong>
          <span data-log-date-label="${entry.id}">${entry.finishedAt}</span>
          <input class="log-date-input" type="datetime-local" value="${toDateTimeLocalValue(entry.finishedAt)}" data-log-date="${entry.id}" hidden />
        </div>
        <details>
          <summary>⋯</summary>
          <button data-action="editLog" data-log-id="${entry.id}">Изменить</button>
          <button data-action="shareLog" data-log-id="${entry.id}">Поделиться</button>
          <button class="danger" data-action="deleteLog" data-log-id="${entry.id}">Удалить</button>
        </details>
      </div>
      <p class="muted">Время: ${entry.duration}</p>
      <pre contenteditable="false" data-log-text="${entry.id}">${entry.text}</pre>
    </article>
  `;
}

function renderMedia(media) {
  if (!media) return `<span>Фото / видео</span>`;
  if (media.type.startsWith("video/")) {
    return `<video src="${media.data}" controls muted playsinline></video>`;
  }
  return `<img src="${media.data}" alt="Медиа тренировки" />`;
}

function toDateTimeLocalValue(value) {
  const date = parseRuDate(value) || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseRuDate(value) {
  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4}),?\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5]));
}
