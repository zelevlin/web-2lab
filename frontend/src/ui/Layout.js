//каркас страницы
import { el, mount } from '../lib/dom.js';

export function createLayout() {
  const header = el('header', { class: 'app-header' },
    el('div', { class:'container' }, el('h1', { textContent:'ToDo App' }))
  );
  const main   = el('main',   { class: 'app-main' },
    el('div', { class:'container' }) // сюда будем класть feature-view
  );
  const footer = el('footer', { class: 'app-footer' },
    el('div', { class:'container' }, el('div', { textContent:'© You' }))
  );
  const root   = el('div',    { class: 'app' }, header, main, footer);

  return {
    el: root,
    mountIn(target) { mount(target, root); },
    getMain() { return main.querySelector('.container'); } // важно: внутренняя .container
  };
}