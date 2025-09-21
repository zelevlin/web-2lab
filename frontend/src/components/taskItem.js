import { el } from "../utils/dom.js";

export function TaskItem(task, { onDelete } = {}) {
  const title = el("span", { text: task.title });

  const del = el("button", {
    className: "delete",
    text: "×",
    onclick: () => onDelete?.(task),
  });

  // draggable и data-id нужны DnD
  const li = el(
    "li",
    { draggable: "true", dataset: { id: task.id } },
    title,
    del
  );

  return li;
}