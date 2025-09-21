// Простая фабрика элементов: el(tag, props, ...children)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "className") node.className = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const ch of children.flat()) {
    if (ch == null) continue;
    node.append(ch.nodeType ? ch : document.createTextNode(String(ch)));
  }
  return node;
}

export function mount(root, ...children) {
  root.append(...children);
  return root;
}