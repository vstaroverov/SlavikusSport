export const routes = [
  { id: "main", label: "Главная" },
  { id: "workout", label: "Тренировка" },
  { id: "program", label: "Программа" },
  { id: "log", label: "Лог" },
  { id: "stats", label: "Стата" },
  { id: "exercises", label: "Упражнения" },
  { id: "info", label: "Инфо" },
  { id: "profile", label: "Профиль" }
];

export function getRoute() {
  const route = window.location.hash.replace("#/", "") || "main";
  return routes.some((item) => item.id === route) ? route : "main";
}

export function navigate(route) {
  window.location.hash = `#/${route}`;
}
