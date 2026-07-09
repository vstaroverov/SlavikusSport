import { clearPlannedWorkout, setPlannedWorkout } from "../features/program/calendarPlanner.js";
import { getWorkouts } from "../features/program/programStorage.js";

export default function assignWorkout(button) {
  const workouts = getWorkouts();
  const message = [
    "0. Отдых",
    ...workouts.map((workout, index) => `${index + 1}. ${workout.title}`)
  ].join("\n");
  const answer = prompt(`Выбери тренировку для даты:\n${message}`, "1");

  if (answer === null) return;
  if (Number(answer) === 0) {
    clearPlannedWorkout(button.dataset.date);
    window.dispatchEvent(new CustomEvent("app:changed"));
    return;
  }

  const index = Number(answer) - 1;
  if (!workouts[index]) return;

  setPlannedWorkout(button.dataset.date, workouts[index].id);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
