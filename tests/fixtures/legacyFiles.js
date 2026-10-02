// Anonymous examples of the original localStorage backup and workout share formats.
export function legacyBackup() {
  const logs = Array.from({ length: 25 }, (_, index) => ({
    id: `old-log-${index + 1}`,
    title: "Тренировка",
    finishedAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
    duration: 1800,
    text: "",
    results: [{ name: "Присед", target: "10", weight: "", sets: 1, weights: [""], done: [index === 24 ? "0" : "10"] }]
  }));
  const workouts = Array.from({ length: 4 }, (_, index) => ({
    id: `old-workout-${index + 1}`,
    title: `Тренировка ${index + 1}`,
    shortName: `Т${index + 1}`,
    exercises: [{ name: "Присед", target: "10", weight: "", sets: 1 }]
  }));
  return {
    app: "Slavikus Sport",
    version: 1,
    exportedAt: "2025-01-01T00:00:00.000Z",
    data: {
      "slavikus:user": JSON.stringify({ id: "vk-demo-user", name: "Тест" }),
      "slavikus:log:vk-demo-user": JSON.stringify(logs),
      "slavikus:workouts": JSON.stringify(workouts)
    }
  };
}

export function legacyWorkoutShare() {
  return {
    app: "Slavikus Sport",
    kind: "workout-share",
    version: 1,
    exportedAt: "2025-01-01T00:00:00.000Z",
    workouts: [{ title: "Тестовая тренировка", exercises: [{ name: "Присед", measure: "repeats", target: "10", weight: "0", sets: "1", time: "" }] }]
  };
}
