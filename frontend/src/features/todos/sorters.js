export const sorters = {
  order: (a, b, dir) => {
    const av = (typeof a.order === 'number') ? a.order : 0;
    const bv = (typeof b.order === 'number') ? b.order : 0;
    return dir * (av - bv);
  },
  createdAt: (a, b, dir) => dir * (a.createdAt - b.createdAt),
  title:     (a, b, dir) => dir * a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' }),
  due:       (a, b, dir, sortDir) => {
    const av = a.due || null, bv = b.due || null;
    if (av === bv) return 0;
    if (av === null) return sortDir === 'asc' ? 1 : -1;
    if (bv === null) return sortDir === 'asc' ? -1 : 1;
    return dir * (av < bv ? -1 : 1);
  },
};