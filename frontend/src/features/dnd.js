// src/features/dnd.js
export function enableListReorder(listEl, { onReorder }) {
  const placeholder = document.createElement("li");
  placeholder.className = "drop-placeholder";

  let draggingId = null;

  listEl.addEventListener("dragstart", (e) => {
    const li = e.target.closest("li[data-id]");
    if (!li) return;
    draggingId = li.dataset.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", draggingId);
    li.classList.add("dragging");
  });

  // Ключевой фикс: завершаем перенос по положению placeholder
  listEl.addEventListener("dragend", (e) => {
    e.target.closest("li")?.classList.remove("dragging");

    // Если placeholder стоит в списке — применяем перестановку
    if (placeholder.parentNode === listEl && draggingId) {
      const beforeId = placeholder.nextElementSibling?.dataset.id || null;
      onReorder({ fromId: draggingId, beforeId });
    }

    removePlaceholder();
    draggingId = null;
  });

  listEl.addEventListener("dragover", (e) => {
    // Разрешаем drop и двигаем placeholder
    e.preventDefault();
    if (!draggingId) return;

    const after = getElementAfterY(listEl, e.clientY);
    if (!after) {
      if (placeholder.parentNode !== listEl || placeholder.nextElementSibling) {
        listEl.appendChild(placeholder);
      }
    } else if (after !== placeholder) {
      listEl.insertBefore(placeholder, after);
    }
  });

  // Drop оставляем (на случай, если отпустили прямо над списком)
  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggingId) return;

    const beforeId = placeholder.nextElementSibling?.dataset.id || null;
    onReorder({ fromId: draggingId, beforeId });

    removePlaceholder();
    draggingId = null;
  });

  function removePlaceholder() {
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  }
}

// Возвращает <li>, который идёт ПОСЛЕ позиции курсора, иначе null (в конец)
function getElementAfterY(container, y) {
  const items = [...container.querySelectorAll("li[data-id]:not(.dragging)")];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  for (const li of items) {
    const rect = li.getBoundingClientRect();
    const offset = y - (rect.top + rect.height / 2);
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = li;
    }
  }
  return closest;
}