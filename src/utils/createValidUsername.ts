export const createValidUsername = (name: string) => {
  return name.toLowerCase().replace(' ', '_');
};
