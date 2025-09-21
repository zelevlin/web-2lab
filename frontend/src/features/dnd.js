// DnD с placeholder между <li>. Слушаем "dnd:auto-tick" и на контейнере, и на document.
export function enableListReorder(listEl, { onReorder } = {}) {
  const placeholder = document.createElement("li");
  placeholder.className = "drop-placeholder";

  let draggingId = null;

  // 1) слушаем на document (универсально)
  document.addEventListener("dnd:auto-tick", onAutoTick);

  // 2) и (дополнительно) на ближайшем скролл-контейнере
  const scrollContainer = resolveScrollContainer(listEl);
  scrollContainer.addEventListener("dnd:auto-tick", onAutoTick);

  function onAutoTick(e) {
    if (!draggingId) return;
    const y = e.detail?.lastClientY;
    if (y == null) return;
    repositionByY(y);
  }

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
    if (placeholder.parentNode === listEl && draggingId) {
      const beforeId = placeholder.nextElementSibling?.dataset.id || null;
      onReorder?.({ fromId: draggingId, beforeId });
    }
    removePlaceholder();
    draggingId = null;
  });

  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggingId) return;
    repositionByY(e.clientY);
  });

  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggingId) return;
    const beforeId = placeholder.nextElementSibling?.dataset.id || null;
    onReorder?.({ fromId: draggingId, beforeId });
    removePlaceholder();
    draggingId = null;
  });

  function repositionByY(clientY) {
    const after = getElementAfterY(listEl, clientY);
    if (!after) {
      if (placeholder.parentNode !== listEl || placeholder.nextElementSibling) {
        listEl.appendChild(placeholder);
      }
    } else if (after !== placeholder) {
      listEl.insertBefore(placeholder, after);
    }
  }

  function removePlaceholder() {
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  }

  return { repositionByY };
}

// найти ближайшего родителя с overflow: auto|scroll
function resolveScrollContainer(el) {
  let cur = el.parentElement;
  while (cur) {
    const cs = getComputedStyle(cur);
    const overflow = cs.overflow + cs.overflowY + cs.overflowX;
    if (/(auto|scroll)/.test(overflow)) return cur;
    cur = cur.parentElement;
  }
  return el;
}

// Возвращает <li>, который идёт ПОСЛЕ позиции курсора (иначе null = в конец)
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