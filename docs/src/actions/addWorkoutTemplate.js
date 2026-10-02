import { showProgramChoiceDialog } from "../components/ProgramDialog.js";
import { getWorkouts, saveWorkouts } from "../features/program/programStorage.js";
import { workoutTemplates } from "../features/program/workoutTemplates.js";

export default async function addWorkoutTemplate(button) {
  const templateId = await showProgramChoiceDialog({
    title: "Выбрать шаблон",
    message: "Выбери готовую тренировку и настрой её под себя.",
    returnFocus: button,
    choices: workoutTemplates.map((template) => ({
      value: template.id,
      label: template.title,
      caption: `${template.exercises.length} упр.`,
      summary: template.exercises.slice(0, 3).map((exercise) => exercise.name).join(", ")
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
