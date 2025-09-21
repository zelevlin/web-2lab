import { el } from "../utils/dom.js";

export function Header() {
  const title = el("h1", { text: "ToDo List" });
  const nav = el(
    "nav",
    { "aria-label": "Основная навигация" },
    el("ul", {},
      el("li", {}, el("a", { href: "#all", text: "Все" })),
      el("li", {}, el("a", { href: "#active", text: "Активные" })),
      el("li", {}, el("a", { href: "#done", text: "Выполненные" }))
    )
  );

  const form = el(
    "form",
    { role: "search" },
    el("label", { for: "q", className: "visually-hidden", text: "Поиск задач" }),
    el("input", { id: "q", name: "q", type: "search", placeholder: "Поиск по названию…" })
  );

  return el("header", {}, title, nav, form);
}