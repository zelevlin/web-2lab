import { el } from "../utils/dom.js";

export function TaskList() {
  // Заготовка секции со списком задач
  const list = el("ul", { id: "task-list" });
  const sect = el(
    "section",
    { "aria-labelledby": "tasks-title" },
    el("h2", { id: "tasks-title", text: "Задачи" }),
    list
  );
  return sect;
}