import { el } from "../utils/dom.js";

export function AppFooter() {
  const p = el("p", { text: "© 2025 ToDo App" });
  return el("footer", {}, p);
}