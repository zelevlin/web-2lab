// dnd.js — вся логика drag-and-drop списка задач
// API: attachDnd({ list, store })
//
// Требования к разметке:
//   - каждый .todo внутри list должен иметь атрибуты:
//       draggable="true" и data-id="<todo.id>"
// Стратегия:
//   - показываем «линию вставки» (drop-before / drop-after)
//   - позволяем бросать в пустую зону (в конец списка)
//   - после drop пересчитываем order = индекс в DOM и сохраняем в store

export function attachDnd({ list, store }) {
  let draggedId = null;

  function clearDropHints() {
    list.querySelectorAll('.drop-before, .drop-after')
      .forEach(el => el.classList.remove('drop-before', 'drop-after'));
  }

  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('.todo');
    if (!li) return;
    draggedId = li.dataset.id;
    e.dataTransfer?.setData?.('text/plain', draggedId); // для совместимости
    e.dataTransfer.effectAllowed = 'move';
    li.classList.add('dragging');
  });

  list.addEventListener('dragend', () => {
    const draggingEl = list.querySelector('.dragging');
    if (draggingEl) draggingEl.classList.remove('dragging');
    clearDropHints();
    draggedId = null;
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();

    const draggingEl = list.querySelector('.dragging');
    if (!draggingEl) return;

    const li = e.target.closest('.todo');

    // наведение на «пустую» часть списка — убираем подсветку, дампнем в конец по drop
    if (!li) {
      clearDropHints();
      return;
    }
    if (li.classList.contains('dragging')) return; // не подсвечиваем сам перетаскиваемый элемент

    clearDropHints();
    const rect = li.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    if (offset < rect.height / 2) {
      li.classList.add('drop-before');
    } else {
      li.classList.add('drop-after');
    }
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggingEl = list.querySelector('.dragging');
    if (!draggingEl) return;

    const hint = list.querySelector('.drop-before, .drop-after');
    const overLi = e.target.closest('.todo');

    if (hint) {
      if (hint.classList.contains('drop-before')) hint.before(draggingEl);
      else hint.after(draggingEl);
      clearDropHints();
    } else if (!overLi) {
      // бросили в пустую область списка — в самый конец
      list.append(draggingEl);
    } else {
      // запасной вариант: бросили над элементом без подсветки → после него
      overLi.after(draggingEl);
    }

    // пересчитать order по текущему DOM и сохранить в store
    // внутри 'drop' после вычисления ids:
    const ids = [...list.querySelectorAll('.todo')].map(li => li.dataset.id);
    const { todos = [] } = store.get();

    const rank = new Map(ids.map((id, idx) => [id, idx]));

    // 1) оставляем все задачи
    const updated = todos.map(t => {
    if (!rank.has(t.id)) return t;          // не на экране — не трогаем
    return { ...t, order: rank.get(t.id) }; // на экране — новый относительный порядок
    });

    // 2) нормализуем order так, чтобы все были уникальны и шли подряд
    const normalized = [...updated]
    .sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t, i) => ({ ...t, order: i }));

    store.set({ todos: normalized });
  });
}