export function createTask({ title }) {
  return {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
}