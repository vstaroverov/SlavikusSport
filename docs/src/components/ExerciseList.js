export function renderExerciseList(exercises, currentIndex = -1) {
  return `
    <div class="exercise-list">
      ${exercises.map((exercise, index) => `
        <div class="exercise-row ${index === currentIndex ? "current" : ""}">
          <span>${index + 1}. ${exercise.name}</span>
          <strong>${formatExerciseMeta(exercise)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function formatExerciseMeta(exercise) {
  return [
    exercise.sets ? `${exercise.sets} подх.` : "",
    exercise.target,
    exercise.weight
  ].filter(Boolean).join(" · ");
}
