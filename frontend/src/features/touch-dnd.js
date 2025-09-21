// Touch/Pointer DnD для списка <ul id="task-list">.
// Позволяет перетаскивать задачи на мобильных.
// API: const ctl = enableTouchReorder(listEl, { onReorder, longPressMs, activateOnMove });
//      ctl.destroy()
export function enableTouchReorder(
  listEl,
  {
    onReorder,
    longPressMs = 550,    // было 180 — ускорили
    activateOnMove = true // начинать drag при небольшом движении
  } = {}
) {
  const scrollContainer = resolveScrollContainer(listEl);
  const placeholder = document.createElement("li");
  placeholder.className = "drop-placeholder";

  const MOVE_THRESHOLD = 5;
  const SCROLL_EDGE = 40; // px от края
  const SPEED_MIN = 2;
  const SPEED_MAX = 8;

  const listWrap = listEl.closest(".list-wrap"); // контейнер для класса .dragging
  let dragging = false;
  let pressTimer = null;
  let pressTarget = null;
  let startX = 0, startY = 0;
  let curY = 0;
  let activeLi = null;
  let activeId = null;
  let raf = null;
  let scrollBlocker = null;

  // --- helpers ---
  function startLongPress(target, clientX, clientY) {
    clearTimeout(pressTimer);
    pressTarget = target;
    pressTimer = setTimeout(() => {
      beginDrag(pressTarget, clientY);
    }, longPressMs);
    startX = clientX;
    startY = clientY;
  }

  function cancelLongPress() {
    clearTimeout(pressTimer);
    pressTimer = null;
    pressTarget = null;
  }

  function beginDrag(targetLi, clientY) {
    if (!targetLi || targetLi.classList.contains("dragging")) return;
    dragging = true;
    activeLi = targetLi;
    activeId = targetLi.dataset.id;
    activeLi.classList.add("dragging");

    // Запретить нативный скролл списка во время drag
    listWrap?.classList.add("dragging"); // CSS: .list-wrap.dragging { touch-action: none; }
    scrollBlocker = (e) => e.preventDefault(); // страховка для Safari
    listWrap?.addEventListener("touchmove", scrollBlocker, { passive: false });

    // Вибрация как тактильный отклик
    try { navigator.vibrate?.(10); } catch {}

    // Вставим placeholder на текущее место
    listEl.insertBefore(placeholder, activeLi.nextElementSibling);
    curY = clientY;

    if (!raf) raf = requestAnimationFrame(step);
    document.body.classList.add("no-select"); // запрет выделения текста во время drag
  }

  function endDrag(commit = true) {
    stopScroll();

    listWrap?.classList.remove("dragging");
    if (scrollBlocker) {
      listWrap?.removeEventListener("touchmove", scrollBlocker);
      scrollBlocker = null;
    }
    document.body.classList.remove("no-select");

    if (activeLi) activeLi.classList.remove("dragging");
    if (commit && activeId && placeholder.parentNode === listEl) {
      const beforeId = placeholder.nextElementSibling?.dataset.id || null;
      onReorder?.({ fromId: activeId, beforeId });
    }
    removePlaceholder();
    dragging = false;
    activeLi = null;
    activeId = null;
  }

  function removePlaceholder() {
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  }

  function step() {
    // автоскролл у краёв контейнера
    if (dragging) {
      const r = scrollContainer.getBoundingClientRect();
      let dir = 0;
      if (curY < r.top + SCROLL_EDGE) dir = -1;
      else if (curY > r.bottom - SCROLL_EDGE) dir = 1;

      if (dir !== 0) {
        const speed = calcSpeed(curY, r, dir);
        scrollContainer.scrollTop += speed * dir;
        repositionByY(curY); // после прокрутки — обновляем placeholder
      }
    }
    raf = requestAnimationFrame(step);
  }

  function stopScroll() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function calcSpeed(y, rect, dir) {
    if (dir < 0) {
      const t = clamp((y - rect.top) / SCROLL_EDGE, 0, 1);
      return lerp(SPEED_MAX, SPEED_MIN, t);
    } else {
      const t = clamp((rect.bottom - y) / SCROLL_EDGE, 0, 1);
      return lerp(SPEED_MAX, SPEED_MIN, t);
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

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

  // --- Pointer handlers (делегирование на ul) ---
  function onPointerDown(e) {
    const li = e.target.closest("li[data-id]");
    if (!li) return;
    if (e.button !== undefined && e.button !== 0) return; // только основная кнопка/палец

    startLongPress(li, e.clientX, e.clientY);
    li.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    // До старта перетаскивания: если включена активация по движению — запускаем drag
    if (pressTimer && activateOnMove && pressTarget) {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_THRESHOLD) {
        cancelLongPress();
        beginDrag(pressTarget, e.clientY);
        e.preventDefault(); // мгновенно блокируем нативный скролл
        return;
      }
    }

    if (!dragging) return;

    e.preventDefault(); // во время drag блокируем нативный скролл
    curY = e.clientY;
    repositionByY(curY);
  }

  function onPointerUp(e) {
    if (pressTimer) {
      cancelLongPress(); // тап без drag — отмена
      return;
    }
    if (dragging) {
      e.preventDefault();
      endDrag(true);
    }
  }

  function onPointerCancel() {
    cancelLongPress();
    if (dragging) endDrag(false);
  }

  listEl.addEventListener("pointerdown", onPointerDown, { passive: true });
  listEl.addEventListener("pointermove", onPointerMove); // непассивный — нужен preventDefault
  listEl.addEventListener("pointerup", onPointerUp);
  listEl.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("blur", onPointerCancel);

  return {
    destroy() {
      onPointerCancel();
      listEl.removeEventListener("pointerdown", onPointerDown);
      listEl.removeEventListener("pointermove", onPointerMove);
      listEl.removeEventListener("pointerup", onPointerUp);
      listEl.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onPointerCancel);
      if (scrollBlocker) {
        listWrap?.removeEventListener("touchmove", scrollBlocker);
        scrollBlocker = null;
      }
      listWrap?.classList.remove("dragging");
      document.body.classList.remove("no-select");
    },
  };
}

// --- утилиты позиционирования ---
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

// находим <li>, который идёт ПОСЛЕ Y-координаты
function getElementAfterY(container, y) {
  const items = [...container.querySelectorAll("li[data-id]:not(.dragging)")];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;
  for (const li of items) {
    const r = li.getBoundingClientRect();
    const offset = y - (r.top + r.height / 2);
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = li;
    }
  }
  return closest;
}