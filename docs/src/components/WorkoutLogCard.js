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
          <span>${entry.finishedAt}</span>
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
