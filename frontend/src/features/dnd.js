// Делегированный DnD для списка <ul id="task-list">,
// вставка визуального placeholder между <li>
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

  listEl.addEventListener("dragend", (e) => {
    e.target.closest("li")?.classList.remove("dragging");
    removePlaceholder();
    draggingId = null;
  });

  listEl.addEventListener("dragover", (e) => {
    e.preventDefault(); // разрешаем drop
    const after = getElementAfterY(listEl, e.clientY);
    if (!after) {
      // курсор ниже всех элементов → вставляем в конец
      if (placeholder.parentNode !== listEl) listEl.appendChild(placeholder);
      else listEl.appendChild(placeholder); // просто перемещаем в конец
    } else {
      listEl.insertBefore(placeholder, after);
    }
  });

  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    // id элемента, ПЕРЕД которым нужно вставить перетаскиваемый
    const beforeId = placeholder.nextElementSibling?.dataset.id || null;
    removePlaceholder();
    if (draggingId) onReorder({ fromId: draggingId, beforeId });
  });

  function removePlaceholder() {
    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }
}

// Возвращает элемент <li>, который находится непосредственно ПОСЛЕ позиции курсора.
// Если курсор ниже всех — вернёт null.
function getElementAfterY(container, y) {
  const items = [...container.querySelectorAll("li[data-id]:not(.dragging)")];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  for (const li of items) {
    const rect = li.getBoundingClientRect();
    const offset = y - (rect.top + rect.height / 2);
    // Нам нужен ближайший элемент, у которого offset < 0 (курсор выше его центра), но максимум из таких
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = li;
    }
  }
  return closest;
}