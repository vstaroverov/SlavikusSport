export async function shareWorkout(entry) {
  const text = `${entry.title}\n${entry.finishedAt}\nВремя: ${entry.duration}\n\n${entry.text}`;

  if (navigator.share) {
    await navigator.share({ title: entry.title, text });
    return;
  }

  await navigator.clipboard.writeText(text);
  alert("Тренировка скопирована. Можно вставить в VK, MAX или Telegram.");
}
