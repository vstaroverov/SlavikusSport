export function getAiRecommendation(name, values) {
  if (values.length < 2) {
    return `По упражнению "${name}" пока мало данных. Сделай еще 2-3 тренировки, и рекомендация станет точнее.`;
  }

  const latest = values[0];
  const previous = values[1];
  if (latest > previous) return `По упражнению "${name}" есть рост. Держи объем и добавляй нагрузку постепенно.`;
  if (latest < previous) return `По упражнению "${name}" нагрузка просела. Стоит проверить отдых и технику.`;
  return `По упражнению "${name}" стабильность. Можно добавить один подход или небольшой вес.`;
}
