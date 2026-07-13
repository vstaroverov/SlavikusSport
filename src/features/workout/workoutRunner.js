export function createWorkoutSession(workout) {
  return {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    title: workout.title,
    startedAt: Date.now(),
    elapsed: 0,
    running: true,
    currentExercise: 0,
    currentSet: 1,
    results: workout.exercises.map((exercise) => ({
      name: exercise.name,
      target: exercise.target,
      weight: exercise.weight || "",
      sets: exercise.sets,
      weights: [],
      done: []
    }))
  };
}

export function addSetResult(session, value) {
  const result = session.results[session.currentExercise];
  const parsed = parseSetInput(value, result);
  result.done.push(parsed.repeats);
  result.weights = Array.isArray(result.weights) ? result.weights : [];
  result.weights.push(parsed.weight);

  if (session.currentSet < result.sets) {
    session.currentSet += 1;
    return session;
  }

  session.currentExercise += 1;
  session.currentSet = 1;
  return session;
}

export function isWorkoutComplete(session) {
  return session.currentExercise >= session.results.length;
}

function parseSetInput(value, result) {
  const text = String(value || "").trim();
  const defaultWeight = normalizeWeight(result.weight);
  const defaultRepeats = String(result.target || "0").trim() || "0";

  if (!text) {
    return { weight: defaultWeight, repeats: defaultRepeats };
  }

  const weighted = text.match(/(\d+(?:[.,]\d+)?)\s*[xх]\s*(\d+)/i);
  if (weighted) {
    return {
      weight: weighted[1].replace(",", "."),
      repeats: weighted[2]
    };
  }

  const repeats = text.match(/\d+/)?.[0] || text;
  return { weight: defaultWeight, repeats };
}

function normalizeWeight(value) {
  const text = String(value || "");
  if (/\d+\s*(с|сек|секунд|мин|минут|ч|час)/i.test(text)) return "";
  const number = text.match(/\d+(?:[.,]\d+)?/)?.[0] || "";
  const normalized = Number(number.replace(",", "."));
  return normalized > 0 ? String(normalized) : "";
}
