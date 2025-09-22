import { el } from "../utils/dom.js";
import { store } from "../store/store.js";

export function TaskItem(task, { onDelete, onChange } = {}) {
  const title = el("span", { className: "task-title", text: task.title });

  const toggleBtn = el("button", {
    className: "task-toggle",
    ariaExpanded: "false",
    title: "Показать описание",
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
    onclick: (e) => { e.stopPropagation(); onDelete?.(task); },
    onmousedown: (e) => e.stopPropagation(),
    ontouchstart: (e) => e.stopPropagation(),
  });

  const actions = el("div", { className: "task-actions" }, toggleBtn, delBtn);
  const row = el("div", { className: "task-row" }, title, actions);

  const descP = el("p", {
    className: "task-desc",
    text: task.description?.trim() ? task.description : "Нет описания",
  });

  const editBtn = el("button", {
    className: "task-edit",
    text: "Редактировать",
    title: "Редактировать задачу",
    onclick: (e) => { e.stopPropagation(); enterEdit(); },
    onmousedown: (e) => e.stopPropagation(),
    ontouchstart: (e) => e.stopPropagation(),
  });

  // --- Форма редактирования (жёстко скрываем по умолчанию) ---
  const titleInput = el("input", {
    type: "text",
    className: "edit-title",
    value: task.title,
  });
  const descInput = el("textarea", {
    className: "edit-desc",
    rows: 4,
    text: task.description ?? "",
  });
  const saveBtn = el("button", { className: "task-save", text: "Сохранить" });
  const cancelBtn = el("button", { className: "task-cancel", text: "Отмена" });

  const editBar = el(
    "div",
    { className: "task-editbar" }, // без hidden атрибута
    el("label", { className: "edit-label", text: "Название" }),
    titleInput,
    el("label", { className: "edit-label", text: "Описание" }),
    descInput,
    el("div", { className: "edit-actions" }, saveBtn, cancelBtn)
  );
  editBar.style.display = "none"; // ← спрятали гарантированно

  const details = el(
    "div",
    { className: "task-details", ariaHidden: "true" },
    descP,
    el("div", { className: "details-actions" }, editBtn),
    editBar
  );

  const li = el(
    "li",
    { className: "task-item", draggable: "true", dataset: { id: task.id } },
    row,
    details
  );

  let expanded = false;
  let editing = false;

  // ЯВНО схлопываем секцию при создании
  setExpanded(false);

  function setExpanded(open) {
    expanded = open;
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.textContent = open ? "▴" : "▾";
    details.setAttribute("aria-hidden", String(!open));

    if (open) {
      details.style.maxHeight = details.scrollHeight + "px";
      details.style.opacity = "1";
      details.style.marginTop = "8px";
      const once = () => {
        details.style.maxHeight = "none";
        details.removeEventListener("transitionend", once);
      };
      details.addEventListener("transitionend", once);
    } else {
      const current = details.scrollHeight;
      details.style.maxHeight = current + "px";
      requestAnimationFrame(() => {
        details.style.maxHeight = "0px";
        details.style.opacity = "0";
        details.style.marginTop = "0";
      });
    }
  }

  function enterEdit() {
    if (editing) return;
    editing = true;

    // показать форму, скрыть текст и кнопку
    editBar.style.display = "";     // ← показать
    descP.style.display = "none";
    editBtn.style.display = "none";

    li.draggable = false;
    li.classList.add("editing");

    titleInput.value = task.title;
    descInput.value = task.description ?? "";
    titleInput.focus();
  }

  function exitEdit() {
    editing = false;

    editBar.style.display = "none"; // ← спрятать
    descP.style.display = "";
    editBtn.style.display = "";

    li.draggable = true;
    li.classList.remove("editing");
  }

  saveBtn.onclick = (e) => {
    e.stopPropagation();
    const newTitle = titleInput.value.trim();
    const newDesc = descInput.value;

    if (!newTitle) {
      titleInput.focus();
      return;
    }

    store.update(task.id, { title: newTitle, description: newDesc });
    title.textContent = newTitle;
    descP.textContent = newDesc?.trim() ? newDesc : "Нет описания";

    exitEdit();
    onChange?.();
  };

  cancelBtn.onclick = (e) => { e.stopPropagation(); exitEdit(); };

  return li;
}