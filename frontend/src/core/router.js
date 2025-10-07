//хэш-роутер
export function createRouter(routes) {
  function parse() {
    const path = location.hash.replace(/^#/, '') || '/';
    return routes[path] ? path : '/';
  }
  let current = parse();
  const subs = new Set();

  window.addEventListener('hashchange', () => {
    const next = parse();
    if (next !== current) { current = next; subs.forEach(fn => fn(current)); }
  });

  return { current: () => current, onChange: (fn) => (subs.add(fn), () => subs.delete(fn)) };
}