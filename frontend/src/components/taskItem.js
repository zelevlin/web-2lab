import { el } from "../utils/dom.js";

export function TaskItem(task, { onDelete } = {}) {
  const title = el("span", { className: "task-title", text: task.title });

  const toggleBtn = el("button", {
    className: "task-toggle",
    ariaExpanded: "false",
    title: "Показать описание",
    // иконка-стрелка
    text: "▾",
    onclick: (e) => {
      e.stopPropagation();
      setExpanded(toggleBtn.getAttribute("aria-expanded") !== "true");
    },
    onmousedown: (e) => e.stopPropagation(),
    ontouchstart: (e) => e.stopPropagation(),
  });

  const delBtn = el("button", {
    className: "delete",
    title: "Удалить",
    text: "×",
    onclick: (e) => {
      e.stopPropagation();
      onDelete?.(task);
    },
    onmousedown: (e) => e.stopPropagation(),
    ontouchstart: (e) => e.stopPropagation(),
  });

  // верхняя строка плитки: название слева, действия справа
  const row = el("div", { className: "task-row" },
    title,
    el("div", { className: "task-actions" }, toggleBtn, delBtn)
  );

  // раскрываемый блок с описанием
  const details = el(
    "div",
    { className: "task-details", ariaHidden: "true" },
    el("p", {
      className: "task-desc",
      text: task.description?.trim() ? task.description : "Нет описания",
    })
  );

  const li = el(
    "li",
    { className: "task-item", draggable: "true", dataset: { id: task.id } },
    row,
    details
  );

  function setExpanded(open) {
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.textContent = open ? "▴" : "▾";
    details.setAttribute("aria-hidden", String(!open));
    // плавное раскрытие за счёт max-height
    if (open) {
      details.style.maxHeight = details.scrollHeight + "px";
      details.style.opacity = "1";
      details.style.marginTop = "8px";
    } else {
      details.style.maxHeight = "0px";
      details.style.opacity = "0";
      details.style.marginTop = "0";
    }
  }

  return li;
}