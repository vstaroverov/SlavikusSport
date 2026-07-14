import { showChoiceDialog } from "../components/InputDialog.js";
import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";
import { workoutTemplates } from "../features/program/workoutTemplates.js";

export default async function addWorkoutTemplate() {
  const templateId = await showChoiceDialog({
    title: "Шаблон тренировки",
    message: "Выбери готовую программу. Ее можно сразу редактировать.",
    choices: workoutTemplates.map((template) => ({
      value: template.id,
      label: template.title,
      caption: `${template.exercises.length} упр.`
    }))
  });

  const template = workoutTemplates.find((item) => item.id === templateId);
  if (!template) return;

  const workouts = getWorkouts();
  workouts.push({
    id: crypto.randomUUID(),
    title: template.title,
    shortName: `Т${workouts.length + 1}`,
    exercises: template.exercises.map((exercise) => ({ ...exercise }))
  });

  saveWorkouts(workouts);
  window.dispatchEvent(new CustomEvent("app:changed"));
}
