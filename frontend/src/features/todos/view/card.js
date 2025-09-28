import { el } from '../../../lib/dom.js';
import { Button } from '../../../ui/Button.js';

export function renderCard(t) {
  const li = el('li', { 
    class:'todo', 
    draggable: true, 
    'data-id': t.id 
  });
  if (t.done) li.classList.add('is-done');

  const title = el('div',{ class:'todo__title', textContent:t.title });
  const desc  = el('div',{ class:'todo__desc',  textContent:t.description || '—' });
  const meta  = el('div',{ class:'todo__meta',  textContent: t.due ? `Срок: ${t.due}` : '' });

  const actions = el('div',{ class:'todo__actions' });
  const toggle  = new Button({ label: t.done ? 'Вернуть' : 'Готово', action:'todo:toggle', size:'sm', variant:'ghost', attrs:{'data-id':t.id} });
  const edit    = new Button({ label:'Редактировать', action:'todo:edit', size:'sm', variant:'ghost', attrs:{'data-id':t.id} });
  const del     = new Button({ label:'Удалить', action:'todo:remove', size:'sm', variant:'danger', attrs:{'data-id':t.id} });
  actions.append(toggle.el, edit.el, del.el);

  li.append(el('div',{}, title, desc, meta), actions);
  return li;
}