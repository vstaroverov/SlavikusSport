import { shiftCalendarMonth } from "../features/program/calendarPlanner.js";
import { dispatchAppChangedKeepingScroll } from "./preserveScroll.js";

export default function changeCalendarMonth(button) {
  shiftCalendarMonth(Number(button.dataset.direction) || 0);
  dispatchAppChangedKeepingScroll(button);
}
