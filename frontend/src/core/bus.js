//простая шина
export function createBus() {
  const map = new Map();
  return {
    on(type, fn) { (map.get(type) ?? map.set(type, new Set()).get(type)).add(fn); },
    off(type, fn) { map.get(type)?.delete(fn); },
    emit(type, payload) { map.get(type)?.forEach(fn => fn(payload)); }
  };
}