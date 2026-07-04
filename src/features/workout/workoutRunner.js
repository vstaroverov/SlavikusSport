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
      done: []
    }))
  };
}

export function addSetResult(session, value) {
  const result = session.results[session.currentExercise];
  result.done.push(value || result.target);

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
