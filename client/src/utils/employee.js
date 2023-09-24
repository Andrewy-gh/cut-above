export const getRandomEmployee = (employees) =>
  employees[Math.floor(Math.random() * employees.length)];
