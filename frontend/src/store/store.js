// src/store/store.js
let tasks = loadFromSession();

export const store = {
  get() {
    return tasks;
  },
  add(task) {
    tasks.push(task);
    saveToSession();
  },
  remove(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveToSession();
  },
  moveBeforeId(fromId, beforeId) {
    const fromIndex = tasks.findIndex((t) => t.id === fromId);
    if (fromIndex === -1) return;

    const [moved] = tasks.splice(fromIndex, 1);
    const toIndex = beforeId ? tasks.findIndex((t) => t.id === beforeId) : -1;

    if (toIndex === -1) tasks.push(moved);
    else tasks.splice(toIndex, 0, moved);

    saveToSession();
  },
};

// ===== helpers =====
function saveToSession() {
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem("tasks");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}