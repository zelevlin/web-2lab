import { el, mount } from "./utils/dom.js";
import { TaskForm } from "./components/taskForm.js";
import { TaskList } from "./components/taskList.js";

// подключаем стили динамически (index.html остаётся только со <script type="module">)
(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "src/styles.css";
  document.head.append(link);
})();

(() => {
  const header = el("header", {}, el("h1", { text: "ToDo List" }));
  const main = el("main");
  const footer = el("footer", {}, el("small", { text: "© 2025 ToDo App" }));

  const list = TaskList();
  const form = TaskForm(() => list._render?.());

  mount(main, form, list);
  mount(document.body, header, main, footer);
})();