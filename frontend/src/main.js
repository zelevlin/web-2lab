import { el, mount } from "./utils/dom.js";
import { store } from "./store/store.js";
import { createTask } from "./store/taskFactory.js";
import { enableListReorder } from "./features/dnd.js";
import { capturePositions, animateReorder } from "./utils/flip.js";

// Подключаем стили динамически
(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "src/styles.css";
  document.head.append(link);
})();

// Каркас
(() => {
  const header = el("header", {}, el("h1", { text: "ToDo List" }));
  const main   = el("main");
  const footer = el("footer", {}, el("small", { text: "© 2025 ToDo App" }));
  mount(document.body, header, main, footer);

  // Форма
  const input = el("input", { type: "text", placeholder: "Новая задача…" });
  const addBtn = el("button", { type: "submit", text: "Добавить" });
  const form = el("form", {}, input, addBtn);

  // Список
  const list = el("ul", { id: "task-list" });
  mount(main, form, list);

  let lastPositions = null;

  function render() {
    // перерисовываем без innerHTML
    while (list.firstChild) list.removeChild(list.firstChild);

    for (const task of store.get()) {
      const title = el("span", { text: task.title });
      const del = el("button", {
        className: "delete",
        text: "×",
        onclick: () => {
          lastPositions = capturePositions(list); // Снять «первый кадр»
          store.remove(task.id);
          redrawWithAnimation();
        },
      });

      const li = el("li", { draggable: "true", dataset: { id: task.id } }, title, del);
      list.appendChild(li);
    }
  }

  function redrawWithAnimation() {
    render();                                 // отрисовали новую раскладку
    animateReorder(list, lastPositions);      // проиграли FLIP
    lastPositions = capturePositions(list);   // запомнили текущие позиции
  }

  // DnD «между элементами»
  enableListReorder(list, {
    onReorder: ({ fromId, beforeId }) => {
      lastPositions = capturePositions(list); // «первый кадр»
      store.moveBeforeId(fromId, beforeId);
      redrawWithAnimation();
    },
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    lastPositions = capturePositions(list); // «первый кадр»
    store.add(createTask({ title: v }));
    input.value = "";
    redrawWithAnimation();
  });

  render();
  lastPositions = capturePositions(list); // начальная фиксация
})();