export const generateId = (length: number = 5) => {
  return Math.random()
    .toString(36)
    .slice(2, length + 2)
    .toUpperCase();
};
