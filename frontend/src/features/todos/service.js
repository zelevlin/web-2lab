//работа с api
export function createTodoService({ API_BASE }) {
  return {
    async list() { const r = await fetch(`${API_BASE}/todos`); return r.json(); },
    async create(todo) { const r = await fetch(`${API_BASE}/todos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(todo) }); return r.json(); },
  };
}
