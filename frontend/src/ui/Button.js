import { run } from '../core/commands.js';
//базовый класс + делегирование
export class Button {
  constructor({ label, action, variant='primary', size='md', attrs = {} }) {
    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = `btn btn--${variant} btn--${size}`;

    // РАНЬШЕ: всегда ставили data-button и data-action
    // ТЕПЕРЬ: data-action — только если action задан
    if (action) this.el.dataset.action = action;

    const span = document.createElement('span');
    span.className = 'btn__label';
    span.textContent = label;
    this.el.append(span);

    for (const [k, v] of Object.entries(attrs)) this.el.setAttribute(k, v);
  }
}

// Делегирование: ловим только те, у кого ЕСТЬ data-action
export function enableButtonDelegation(root) {
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]:not([data-scope="local"])'); // ← игнор локальных
    if (!btn || !root.contains(btn)) return;

    const action = btn.dataset.action;
    if (!action) return; // двойная страховка

    btn.classList.add('is-loading');
    btn.disabled = true;
    try {
      await run(action, { event: e, target: btn });
    } finally {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  });
}