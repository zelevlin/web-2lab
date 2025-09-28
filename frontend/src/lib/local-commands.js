//аналог файла commands.js но для локальных команд, чтобы сохранить стиль написания кода
export function createLocalCommands(root) {
  const reg = new Map();
  const onClick = (e) => {
    const btn = e.target.closest('[data-local-action]');
    if (!btn || !root.contains(btn)) return;
    const name = btn.dataset.localAction;
    const fn = reg.get(name);
    if (fn) fn({ event: e, target: btn, root });
  };
  return {
    register(name, fn) { reg.set(name, fn); },
    enable() { root.addEventListener('click', onClick); },
    disable() { root.removeEventListener('click', onClick); reg.clear(); }
  };
}