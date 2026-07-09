import { shiftCalendarMonth } from "../features/program/calendarPlanner.js";

export default function changeCalendarMonth(button) {
  shiftCalendarMonth(Number(button.dataset.direction) || 0);
  window.dispatchEvent(new Event("app:changed"));
}
