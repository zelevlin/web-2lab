// склейка всего воедино
import { createBus } from './core/bus.js';
import { createStore } from './core/store.js';
import { createRouter } from './core/router.js';
import { loadConfig } from './core/config.js';
import { createLayout } from './ui/Layout.js';
import { enableButtonDelegation } from './ui/Button.js';
import { createTodosView } from './features/todos/view/index.js';
import { createTodoModel } from './features/todos/model.js';

const bus = createBus();
const store = createStore({ todos: [] }, { key: 'app:v1' });
const router = createRouter({ '/': true, '/about': true });

function ensureFavicon(href) {
  const head = document.head;
  if (!head) return;

  const existing = head.querySelector('link[rel~="icon"]');
  const link = existing ?? document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = href;

  if (!existing) head.appendChild(link);
}

const cfg = await loadConfig(); // { API_BASE: ... }
console.log('Config:', cfg);

try {
  console.log('before createLayout');
  const layout = createLayout(); // layout живет внутри try
  console.log('after createLayout', layout);

  let host = document.getElementById('app');
  if (!host) {
    host = document.createElement('div');
    host.id = 'app';
    const parent = document.body ?? document.documentElement;
    parent.appendChild(host);
  }
  console.log('host #app =', host);

  ensureFavicon(new URL('./favicon.ico', window.location.href).toString());

  layout.mountIn(host);
  console.log('Layout mounted');

  enableButtonDelegation(document);
  console.log('Delegation enabled');

  // Роутинг 
  function renderRoute() {
    const main = layout.getMain();
    if (!main) throw new Error('layout.getMain() returned null/undefined');
    main.replaceChildren();

    const path = router.current();
    if (path === '/') {
      const model = createTodoModel(store);
      const view = createTodosView(store, model);
      main.append(view.el);
    } else if (path === '/about') {
      main.append(document.createTextNode('About page…'));
    }
  }

  renderRoute();
  router.onChange(renderRoute);

} catch (e) {
  console.error('BOOT ERROR:', e);
}
