export const filters = {
  all:    () => true,
  active: (t) => !t.done,
  done:   (t) =>  t.done,
};