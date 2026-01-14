export interface User {
  id: string;
  firstName: string;
}

export interface Appointment {
  id: string;
  date: string;
  employee?: User;
  client?: User;
  start: string;
  service: 'Haircut' | 'Beard Trim' | 'Straight Razor Shave' | 'Cut and Shave Package' | 'The Full Package';
}
