// Снимает "снимок" позиций элементов списка
export function capturePositions(listEl) {
  const map = new Map();
  listEl.querySelectorAll("li[data-id]").forEach((li) => {
    const rect = li.getBoundingClientRect();
    map.set(li.dataset.id, { top: rect.top, left: rect.left });
  });
  return map;
}

// Анимирует переход из prevPositions в текущую раскладку
export function animateReorder(listEl, prevPositions) {
  if (!prevPositions) return;

  const els = [...listEl.querySelectorAll("li[data-id]")];

  els.forEach((li) => {
    const id = li.dataset.id;
    const prev = prevPositions.get(id);
    if (!prev) return; // новый элемент — можно сделать fade-in, если захочешь

    const rect = li.getBoundingClientRect();
    const dx = prev.left - rect.left;
    const dy = prev.top - rect.top;

    if (dx || dy) {
      // инвертируем
      li.style.transform = `translate(${dx}px, ${dy}px)`;
      li.style.transition = "none";

      // следующий кадр — проиграть к 0 с переходом
      requestAnimationFrame(() => {
        li.style.willChange = "transform";
        li.style.transition = ""; // вернём CSS transition из стилей
        li.style.transform = "translate(0, 0)";
      });

      // уборка will-change в конце
      const onEnd = () => {
        li.style.willChange = "";
        li.removeEventListener("transitionend", onEnd);
      };
      li.addEventListener("transitionend", onEnd);
    }
  });
}