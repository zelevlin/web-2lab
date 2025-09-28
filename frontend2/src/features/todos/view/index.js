import { el } from '../../../lib/dom.js';
import { Button } from '../../../ui/Button.js';
import { register } from '../../../core/commands.js';
import { select } from '../../../lib/ui-kit.js';
import { createComposer } from './composer.js';
import { renderCard } from './card.js';
import { filters } from '../filters.js';
import { sorters } from '../sorters.js';
import { attachDnd } from './dnd.js';

export function createTodosView(store, model) {
  const root = el('section', { class: 'container' });

  // --- Toolbar row 1: Добавить / Поиск / Фильтр ---
  const addBtn = new Button({ label: 'Добавить', action: 'todo:add', variant: 'primary' });
  const search = el('input', {
    class: 'input',
    type: 'search',
    placeholder: 'Поиск по названию…',
    'aria-label': 'Поиск по названию'
  });
  const status = select(
    [['all', 'Все'], ['active', 'Невыполненные'], ['done', 'Выполненные']],
    { class: 'select', 'aria-label': 'Фильтр по статусу' }
  );
  const toolbar = el('div', { class: 'toolbar' }, addBtn.el, search, status);

  // --- Toolbar row 2: Сортировки ---
  const sortBy = select(
    [
      ['order', 'Ручной порядок'], // DnD работает поверх этого сортировщика
      ['createdAt', 'По созданию'],
      ['due', 'По сроку'],
      ['title', 'По названию']
    ],
    { class: 'select', 'aria-label': 'Поле сортировки' }
  );
  const sortDir = select(
    [['desc', 'По убыванию'], ['asc', 'По возрастанию']],
    { class: 'select', 'aria-label': 'Порядок' }
  );
  const prioritize = el(
    'label',
    { class: 'label' },
    el('input', { type: 'checkbox', id: 'prioritize' }),
    ' Сначала невыполненные'
  );
  const toolbar2 = el(
    'div',
    { class: 'toolbar__row' },
    el('span', { class: 'label', textContent: 'Сортировка:' }),
    sortBy,
    sortDir,
    prioritize
  );

  // --- Composer: форма добавления/редактирования ---
  const composer = createComposer({
    onSave: (payload, id) => {
      if (id) model.update(id, payload);
      else model.add(payload);
    },
    onCancel: () => {}
  });

  // --- Список задач ---
  const viewport = el('div', { class: 'todos__viewport' });
  const listwrap = el('div', { class: 'todos__listwrap' });
  const list = el('ul', { class: 'todos__list' });
  listwrap.append(list);
  viewport.append(list);

  root.append(toolbar, toolbar2, composer.el, viewport);

  // --- UI state ---
  // По умолчанию включаем «ручной порядок», чтобы DnD сразу был ожидаемо консистентен.
  const ui = { q: '', status: 'all', sortBy: 'order', sortDir: 'asc', prioritize: false };

  // --- Фильтры/сортировки ---
  search.addEventListener('input', () => {
    ui.q = search.value.trim().toLowerCase();
    render();
  });
  status.addEventListener('change', () => {
    ui.status = status.value;
    render();
  });
  sortBy.addEventListener('change', () => {
    ui.sortBy = sortBy.value;
    render();
  });
  sortDir.addEventListener('change', () => {
    ui.sortDir = sortDir.value;
    render();
  });
  prioritize.querySelector('input').addEventListener('change', (e) => {
    ui.prioritize = e.target.checked;
    render();
  });

  // --- Подключаем DnD к списку ---
  attachDnd({ list, store });

  // --- Рендер ---
  function render() {
    const { todos = [] } = store.get();
    const dir = ui.sortDir === 'asc' ? 1 : -1;

    const shown = todos
      .filter(filters[ui.status])
      .filter((t) => !ui.q || t.title.toLowerCase().includes(ui.q))
      .sort((a, b) => {
        const s = sorters[ui.sortBy];
        return ui.sortBy === 'due' ? s(a, b, dir, ui.sortDir) : s(a, b, dir);
      });

    const final = ui.prioritize
      ? [...shown.filter((t) => !t.done), ...shown.filter((t) => t.done)]
      : shown;

    list.replaceChildren();
    if (final.length === 0) {
      list.append(el('li', { class: 'todo__empty', textContent: 'Нет задач' }));
      return;
    }

    final.forEach((t) => {
      const card = renderCard(t);
      // DnD: карточка должна быть draggable и иметь data-id
      card.setAttribute('draggable', 'true');
      card.dataset.id = t.id;
      list.append(card);
    });
  }

  // --- Подписка на store и первый рендер ---
  const unsub = store.subscribe(render);
  render();

  // --- Команды ---
  register('todo:add', () => composer.open());

  register('todo:edit', ({ target }) => {
    const id = target.getAttribute('data-id');
    if (!id) return;
    const { todos = [] } = store.get();
    const todo = todos.find((t) => t.id === id);
    if (todo) composer.open(todo);
  });

  register('todo:remove', ({ target }) => {
    const id = target.getAttribute('data-id');
    if (id && confirm('Удалить задачу?')) model.remove(id);
  });

  register('todo:toggle', ({ target }) => {
    const id = target.getAttribute('data-id');
    if (id) model.toggle(id);
  });

  return { el: root, destroy: unsub };
}