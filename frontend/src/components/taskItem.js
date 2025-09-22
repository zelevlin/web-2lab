import { el } from "../utils/dom.js";
import { store } from "../store/store.js";

// --- helpers ---
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Плавное раскрытие/сворачивание высоты секции через WAAPI (без магических чисел)
async function animateHeight(section, open, { duration = 220, easing = "ease" } = {}) {
  const startH = section.getBoundingClientRect().height;

  if (open) {
    section.style.height = "auto";
    const endH = section.getBoundingClientRect().height;
    section.style.height = startH + "px";
    section.style.opacity = startH ? section.style.opacity : "0";

    const anim = section.animate(
      [{ height: startH + "px", opacity: 0 }, { height: endH + "px", opacity: 1 }],
      { duration, easing }
    );
    await anim.finished.catch(() => {});
    section.style.height = "auto";
    section.style.opacity = "1";
  } else {
    const endH = 0;
    if (getComputedStyle(section).height === "auto") {
      section.style.height = section.getBoundingClientRect().height + "px";
    }
    const fromH = section.style.height || startH + "px";
    const anim = section.animate(
      [{ height: fromH, opacity: 1 }, { height: endH + "px", opacity: 0 }],
      { duration, easing }
    );
    await anim.finished.catch(() => {});
    section.style.height = "0px";
    section.style.opacity = "0";
  }
}

// Перезапуск CSS-анимации рамки по классу и ожидание её завершения
function playAnimationClass(el, className, expectedAnimName) {
  el.classList.remove(className);
  // eslint-disable-next-line no-unused-expressions
  void el.offsetWidth; // force reflow
  el.classList.add(className);

  return new Promise((resolve) => {
    const onEnd = (e) => {
      if (e.target !== el) return;
      if (expectedAnimName && e.animationName !== expectedAnimName) return;
      el.removeEventListener("animationend", onEnd);
      resolve();
    };
    el.addEventListener("animationend", onEnd);
  });
}

export function TaskItem(task, { onDelete, onChange } = {}) {
  // верхняя строка
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

  // раскрывающийся блок
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

  // форма редактирования (скрыта по умолчанию)
  const titleInput = el("input", { type: "text", className: "edit-title" });
  const descInput = el("textarea", { className: "edit-desc", rows: 4 });
  const saveBtn = el("button", { className: "task-save", text: "Сохранить" });
  const cancelBtn = el("button", { className: "task-cancel", text: "Отмена" });

  const editBar = el(
    "div",
    { className: "task-editbar" },
    el("label", { className: "edit-label", text: "Название" }),
    titleInput,
    el("label", { className: "edit-label", text: "Описание" }),
    descInput,
    el("div", { className: "edit-actions" }, saveBtn, cancelBtn)
  );
  editBar.style.display = "none"; // скрыто изначально

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

  // состояние
  let expanded = false;
  let editing = false;

  // схлопнуть секцию при создании
  setExpanded(false);

  // --- поведение ---
  async function setExpanded(open) {
    if (expanded === open) return;
    expanded = open;
    toggleBtn.setAttribute("aria-expanded", String(open));
    toggleBtn.textContent = open ? "▴" : "▾";
    details.setAttribute("aria-hidden", String(!open));
    li.classList.toggle("is-open", open);
    await animateHeight(details, open);
  }

  async function enterEdit() {
    if (editing) return;
    editing = true;

    // раскрываем описание, чтобы была видна форма
    await setExpanded(true);

    editBar.style.display = "";
    descP.style.display = "none";
    editBtn.style.display = "none";

    li.draggable = false;
    li.classList.add("editing");

    // очистить прошлые рамки и сыграть жёлтую «снизу вверх»
    li.classList.remove("saved-white", "saving-green", "editing-solid", "editing-yellow");
    await playAnimationClass(li, "editing-yellow", "border-fill-up");
    li.classList.remove("editing-yellow");
    li.classList.add("editing-solid"); // статичная жёлтая на время редактирования

    // заполнить поля и сфокусироваться
    titleInput.value = task.title;
    descInput.value = task.description ?? "";
    titleInput.focus();
  }

  function exitEdit() {
    editing = false;

    // прячем только форму, секцию описания НЕ закрываем
    editBar.style.display = "none";
    descP.style.display = "";
    editBtn.style.display = "";

    li.draggable = true;
    li.classList.remove("editing");
    // рамочные классы управляются в save/cancel
  }

  // Сохранить: анимируем зелёную рамку, прячем форму, описание остаётся открытым
  saveBtn.onclick = async (e) => {
    e.stopPropagation();
    const newTitle = titleInput.value.trim();
    const newDesc = descInput.value;
    if (!newTitle) { titleInput.focus(); return; }

    // обновить данные и текст
    store.update(task.id, { title: newTitle, description: newDesc });
    title.textContent = newTitle;
    descP.textContent = newDesc?.trim() ? newDesc : "Нет описания";

    // снять жёлтое состояние; запустить зелёный «оббегающий» контур
    li.classList.remove("editing-solid", "editing-yellow", "saved-white", "saving-green");
    await playAnimationClass(li, "saving-green", "border-sweep");
    li.classList.remove("saving-green");
    li.classList.add("saved-white"); // финал — белая рамка
    await delay(140);

    // закрываем только форму — секция описания остаётся раскрытой
    exitEdit();

    // опционально убрать белую рамку спустя мгновение
    setTimeout(() => li.classList.remove("saved-white"), 300);

    //onChange?.();
  };

  // Отмена: убираем рамки и скрываем форму — секция описания остаётся открытой
  cancelBtn.onclick = async (e) => {
    e.stopPropagation();
    li.classList.remove("editing-solid", "editing-yellow", "saving-green", "saved-white");
    exitEdit();
  };

  return li;
}