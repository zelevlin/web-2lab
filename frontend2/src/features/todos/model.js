//модель (чистые функции)
export function createTodoModel(store) {
  function add({ title, description = '', due = null }) {
    const todos = store.get().todos ?? [];
    const maxOrder = todos.length ? Math.max(...todos.map(t => t.order ?? 0)) : -1;
    const todo = { id: crypto.randomUUID(), title, description, due, done: false, createdAt: Date.now(), order: maxOrder + 1, };
    store.set({ todos: [todo, ...todos] });
  }
  function toggle(id) {
    const todos = (store.get().todos ?? []).map(t => t.id === id ? { ...t, done: !t.done } : t);
    store.set({ todos });
  }
  function remove(id) {
    const todos = (store.get().todos ?? []).filter(t => t.id !== id);
    store.set({ todos });
  }
  function update(id, patch) {
    const todos = (store.get().todos ?? []).map(t => t.id === id ? { ...t, ...patch } : t);
    store.set({ todos });
  }
  return { add, toggle, remove, update };
}