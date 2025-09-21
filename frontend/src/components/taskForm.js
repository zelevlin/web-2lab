import { el } from "../utils/dom.js";
import { store } from "../store/store.js";
import { createTask } from "../store/taskFactory.js";

export function TaskForm(onChange) {
  const input = el("input", { type: "text", placeholder: "Новая задача…" });
  const addBtn = el("button", { type: "submit", text: "Добавить" });
  const form = el("form", {}, input, addBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    store.add(createTask({ title: v }));
    input.value = "";
    onChange?.();
  });

  return form;
}