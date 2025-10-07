import { el } from '../../../lib/dom.js';
import { Button } from '../../../ui/Button.js';
import { row, label, inputText, textArea, inputDate } from '../../../lib/ui-kit.js';
import { createLocalCommands } from '../../../lib/local-commands.js';

export function createComposer({ onSave, onCancel }) {
  const root = el('div', { class: 'composer', hidden: true });

  const title = inputText('c_title', 'Название', { required:true, 'aria-label':'Название' });
  const desc  = textArea('c_desc', 'Описание', { 'aria-label':'Описание' });
  const due   = inputDate('c_due', { 'aria-label':'Срок выполнения' });

  // Кнопки локальные
  const save   = new Button({ label:'Сохранить', variant:'primary', size:'sm', attrs:{ 'data-scope':'local', 'data-local-action':'save' } });
  const cancel = new Button({ label:'Отмена',    variant:'ghost',   size:'sm', attrs:{ 'data-scope':'local', 'data-local-action':'cancel' } });


  root.append(
    row(label('c_title','Название'), title),
    row(label('c_desc','Описание'), desc),
    row(label('c_due','Срок'), due),
    row(el('span',{class:'label'}), el('div',{class:'composer__row'}, save.el, cancel.el))
  );

  // Локальные команды
  const lc = createLocalCommands(root);
  lc.register('save', () => {
    const payload = {
      title: title.value.trim(),
      description: desc.value.trim(),
      due: due.value || null
    };
    if (!payload.title) { title.focus(); return; }
    const id = root.dataset.editingId || null;
    onSave?.(payload, id);
    close();
  });
  lc.register('cancel', () => {
    onCancel?.();
    close();
  });
  lc.enable();

  function open(todo=null) {
    root.hidden = false;
    if (todo) {
      title.value = todo.title;
      desc.value  = todo.description || '';
      due.value   = todo.due || '';
      root.dataset.editingId = todo.id;
    } else {
      title.value = ''; desc.value = ''; due.value = '';
      delete root.dataset.editingId;
    }
    title.focus();
  }
  function close() {
    root.hidden = true;
    title.value = desc.value = due.value = '';
    delete root.dataset.editingId;
  }

  return { el: root, open, close };
}