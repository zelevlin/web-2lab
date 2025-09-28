//безопасные хелперы
export function el(tag, props = {}, ...children) {
  const n = document.createElement(tag);

  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;

    if (k === 'class') n.className = v;
    else if (k === 'dataset') for (const [dk, dv] of Object.entries(v)) n.dataset[dk] = dv;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('aria-')) n.setAttribute(k, v);
    // 🔽 главное: поддержка булевых свойств/атрибутов (hidden, disabled, required и т.д.)
    else if (typeof v === 'boolean') {
      n[k] = v;                   // свойство DOM (н-р, n.hidden = true)
      if (v) n.setAttribute(k, ''); // чтобы было видно и как атрибут
    }
    else if (k in n) n[k] = v;   // textContent, id, value, type и др.
    else n.setAttribute(k, v);   // запасной вариант
  }

  for (const ch of children.flat()) {
    if (ch == null) continue;
    n.append(ch instanceof Node ? ch : document.createTextNode(String(ch)));
  }
  return n;
}

export function mount(root, ...children) {
  if (!root) throw new Error('mount(): root is null');
  root.replaceChildren(...children);
}