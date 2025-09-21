import { el, mount } from "./utils/dom.js";
import { store } from "./store/store.js";
import { createTask } from "./store/taskFactory.js";
import { enableListReorder } from "./features/dnd.js";

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

  // DnD «между элементами»
  enableListReorder(list, {
    onReorder: ({ fromId, beforeId }) => {
      store.moveBeforeId(fromId, beforeId);
      render();
    },
  });

  function render() {
    while (list.firstChild) list.removeChild(list.firstChild);

    for (const task of store.get()) {
      const title = el("span", { text: task.title });
      const del = el("button", {
        className: "delete",
        text: "×",
        onclick: () => { store.remove(task.id); render(); },
      });

      const li = el("li", { draggable: "true", dataset: { id: task.id } }, title, del);
      list.appendChild(li);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    store.add(createTask({ title: v }));
    input.value = "";
    render();
  });

  render();
})();