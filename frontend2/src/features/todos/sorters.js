export const sorters = {
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