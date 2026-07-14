export const workoutTemplates = [
  {
    id: "legs",
    title: "День ног",
    exercises: [
      exercise("Разминка", "1", "", 1),
      exercise("Подтягивания", "15", "", 1),
      exercise("Отжимания", "25", "", 1),
      exercise("Пресс", "25", "", 1),
      exercise("Разгиб ног сидя", "20", "61", 3),
      exercise("Подъем на бицепс бедра", "15", "45", 3),
      exercise("Толкание платформы лежа", "15", "200", 3),
      exercise("Присед в станке", "15", "65", 3),
      exercise("Присед со штангой", "15", "40", 3),
      exercise("Подъем на носки", "15", "65", 3),
      exercise("Заминка", "1", "", 1),
      exercise("Вис", "29 секунд", "", 1)
    ]
  },
  {
    id: "upper",
    title: "Верх",
    exercises: [
      exercise("Разминка", "1", "", 1),
      exercise("Подтягивания", "12", "", 3),
      exercise("Брусья", "15", "", 3),
      exercise("Отжимания", "20", "", 3),
      exercise("Штанга на грудь", "12", "", 3),
      exercise("Штанга на бицепс", "12", "", 3),
      exercise("Пресс", "25", "", 3),
      exercise("Заминка", "1", "", 1)
    ]
  },
  {
    id: "back",
    title: "Спина",
    exercises: [
      exercise("Разминка", "1", "", 1),
      exercise("Подтягивания", "10", "", 4),
      exercise("Гиперэкстензия", "20", "", 3),
      exercise("Становая тяга", "10", "", 3),
      exercise("Становая со шрагами", "10", "", 3),
      exercise("Пресс", "25", "", 3),
      exercise("Заминка", "1", "", 1)
    ]
  },
  {
    id: "chest",
    title: "Грудь",
    exercises: [
      exercise("Разминка", "1", "", 1),
      exercise("Отжимания", "25", "", 3),
      exercise("Брусья", "15", "", 3),
      exercise("Штанга на грудь", "12", "", 3),
      exercise("Гантели на бицепс", "12", "", 3),
      exercise("Пресс", "25", "", 3),
      exercise("Заминка", "1", "", 1)
    ]
  }
];

function exercise(name, target, weight, sets) {
  return { name, target, weight, sets };
}
