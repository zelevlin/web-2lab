let tasks = [];

export const store = {
  get: () => tasks.slice(),
  add: (task) => { tasks.push(task); },
  remove: (id) => { tasks = tasks.filter(t => t.id !== id); },

  // Переместить fromId ПЕРЕД beforeId (если beforeId = null → в конец)
  moveBeforeId(fromId, beforeId) {
    const fromIndex = tasks.findIndex(t => t.id === fromId);
    if (fromIndex === -1) return;

    const [moved] = tasks.splice(fromIndex, 1);

    let insertAt = tasks.length; // по умолчанию в конец
    if (beforeId) {
      const idx = tasks.findIndex(t => t.id === beforeId);
      if (idx !== -1) insertAt = idx;
    }
    tasks.splice(insertAt, 0, moved);
  },
};