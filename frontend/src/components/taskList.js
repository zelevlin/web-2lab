import { el } from "../utils/dom.js";
import { store } from "../store/store.js";
import { TaskItem } from "./taskItem.js";
import { enableListReorder } from "../features/dnd.js";
import { capturePositions, animateReorder } from "../utils/flip.js";

export function TaskList() {
  const list = el("ul", { id: "task-list" });
  let lastPositions = null;

  function render() {
    while (list.firstChild) list.removeChild(list.firstChild);

    for (const task of store.get()) {
      const li = TaskItem(task, {
        onDelete: (t) => {
          lastPositions = capturePositions(list);
          store.remove(t.id);
          redrawWithAnimation();
        },
      });
      list.appendChild(li);
    }
  }

  function redrawWithAnimation() {
    render();
    animateReorder(list, lastPositions);
    lastPositions = capturePositions(list);
  }

  // даём внешнему миру способ попросить перерисовку
  list._render = redrawWithAnimation;

  // DnD «между элементами»
  enableListReorder(list, {
    onReorder: ({ fromId, beforeId }) => {
      lastPositions = capturePositions(list);
      store.moveBeforeId(fromId, beforeId);
      redrawWithAnimation();
    },
  });

  render();
  lastPositions = capturePositions(list);
  return list;
}