import { el, mount } from "./utils/dom.js";
import { Header } from "./components/header.js";
import { TaskList } from "./components/taskList.js";
import { AppFooter } from "./components/footer.js";

// 1) Подключаем стили динамически (чтобы в index.html был только <script>)
(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "src/styles.css";
  document.head.append(link);
})();

// 2) Строим семантический каркас страницы
(() => {
  const header = Header();
  const main = el("main", {}, TaskList());
  const footer = AppFooter();

  mount(document.body, header, main, footer);
})();