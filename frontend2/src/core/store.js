//глобальное состояния + persist
export function createStore(initial = {}, { key } = {}) {
  let state = initial;
  const subs = new Set();

  if (key) {
    try { state = { ...state, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch {}
  }

  function get() { return state; }
  function set(patch) {
    state = { ...state, ...patch };
    if (key) localStorage.setItem(key, JSON.stringify(state));
    subs.forEach(fn => fn(state));
  }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  return { get, set, subscribe };
}