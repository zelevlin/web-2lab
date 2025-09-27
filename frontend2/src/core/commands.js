//единая точка бизнес-логики глобально
const registry = new Map();

export function register(name, fn) { registry.set(name, fn); }
export function run(name, ctx) {
  const fn = registry.get(name);
  if (!fn) throw new Error(`Unknown command: ${name}`);
  return fn(ctx);
}