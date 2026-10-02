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
      measure: exercise.measure || "",
      target: exercise.target,
      time: exercise.time || "",
      weight: exercise.weight || "",
      sets: exercise.sets,
      weights: [],
      times: [],
      done: []
    }))
  };
}

export function addSetResult(session, value) {
  const result = session.results[session.currentExercise];
  if (result.measure === "completion") {
    result.done.push("1");
    result.weights = Array.isArray(result.weights) ? result.weights : [];
    result.weights.push("");
    return advanceWorkoutStep(session, result);
  }
  if (result.measure === "distanceKm" || result.measure === "distanceM") {
    const distance = Number(String(value?.distance || "").replace(",", "."));
    const seconds = Number(value?.seconds || 0);
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(seconds) || seconds <= 0) {
      throw new Error("Укажи дистанцию и время больше нуля.");
    }
    result.done.push(String(distance));
    result.times = Array.isArray(result.times) ? result.times : [];
    result.times.push(Math.round(seconds));
    result.weights.push("");
    return advanceWorkoutStep(session, result);
  }
  const parsed = parseSetInput(value, result);
  result.done.push(parsed.repeats);
  result.weights = Array.isArray(result.weights) ? result.weights : [];
  result.weights.push(parsed.weight);

  return advanceWorkoutStep(session, result);
}

export function skipSet(session) {
  const result = session.results[session.currentExercise];
  return advanceWorkoutStep(session, result);
}

function advanceWorkoutStep(session, result) {
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
