import bcrypt from 'bcrypt';

export const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@email.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'admin',
  },
  {
    firstName: 'First',
    lastName: 'User',
    email: 'user1@email.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'client',
  },
  {
    firstName: 'Second',
    lastName: 'User',
    email: 'user2@email.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'client',
  },
  {
    firstName: 'Third',
    lastName: 'User',
    email: 'user3@email.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'client',
  },
  {
    firstName: 'Andre',
    lastName: 'S',
    email: 'andre@cutaboveshop.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'employee',
    // image: insert image url
    profile:
      'Andre has honed his skills and techniques to deliver top-notch grooming services. In his free time, Andre enjoys exploring the outdoors and staying active. He loves hiking, running, and playing sports, and is always up for a new adventure.',
  },
  {
    firstName: 'Obi',
    lastName: 'M',
    email: 'obi@cutaboveshop.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'employee',
    // image: insert image url
    profile:
      'Meet Obi, our skilled and talented barber who is dedicated to providing his clients with top-notch grooming services. He loves to travel and discover new cultures, and is always planning his next adventure.',
  },
  {
    firstName: 'Salah',
    lastName: 'R',
    email: 'salah@cutabove.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'employee',
    // image: insert image url
    profile:
      'With a natural talent for hair cutting and styling, Salah takes pride in helping his clients achieve the perfect look. In his free time, Salah enjoys painting and drawing, and is always attending concerts.  He is a big fan of classic rock and jazz.',
  },
  // Additional clients
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'johnsmith@email.com',
    passwordHash: bcrypt.hashSync('client123', 10),
    role: 'client',
  },
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emilyj@email.com',
    passwordHash: bcrypt.hashSync('client456', 10),
    role: 'client',
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michaelb@email.com',
    passwordHash: bcrypt.hashSync('client789', 10),
    role: 'client',
  },
  {
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarahd@email.com',
    passwordHash: bcrypt.hashSync('client101', 10),
    role: 'client',
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'davidw@email.com',
    passwordHash: bcrypt.hashSync('client202', 10),
    role: 'client',
  },
];

// Services that can be booked
export const services = [
  'Haircut',
  'Beard Trim',
  'Straight Razor Shave',
  'Cut and Shave Package',
  'The Full Package',
];

// Statuses for appointments
export const appointmentStatuses = [
  'scheduled',
  'checked-in',
  'completed',
  'no show',
];

export const appointments = [
  {
    date: '2024-01-22',
    start: '17:00',
    end: '17:30',
    service: 'Haircut',
    status: 'completed',
  },
  {
    date: '2024-01-23',
    start: '14:00',
    end: '14:30',
    service: 'Beard Trim',
    status: 'completed',
  },
  {
    date: '2024-01-24',
    start: '10:00',
    end: '10:30',
    service: 'Haircut',
    status: 'completed',
  },
  {
    date: '2022-01-24',
    start: '13:00',
    end: '13:30',
    service: 'The Full Package',
    status: 'no show',
  },
  // Future appointments
  {
    date: '2025-10-15',
    start: '09:00',
    end: '09:30',
    service: 'Haircut',
    status: 'scheduled',
  },
  {
    date: '2025-10-15',
    start: '10:00',
    end: '10:45',
    service: 'The Full Package',
    status: 'scheduled',
  },
  {
    date: '2025-10-16',
    start: '11:00',
    end: '11:30',
    service: 'Beard Trim',
    status: 'scheduled',
  },
  {
    date: '2025-10-16',
    start: '14:00',
    end: '14:45',
    service: 'Cut and Shave Package',
    status: 'scheduled',
  },
  {
    date: '2025-10-17',
    start: '13:00',
    end: '13:30',
    service: 'Haircut',
    status: 'scheduled',
  },
  {
    date: '2025-10-17',
    start: '15:00',
    end: '15:30',
    service: 'Straight Razor Shave',
    status: 'scheduled',
  },
];

// Schedule data for the barbershop
export const schedules = [
  {
    date: '2025-10-15',
    open: '08:00',
    close: '17:00',
  },
  {
    date: '2025-10-16',
    open: '08:00',
    close: '17:00',
  },
  {
    date: '2025-10-17',
    open: '08:00',
    close: '17:00',
  },
  {
    date: '2025-10-18',
    open: '09:00',
    close: '15:00',
  },
  {
    date: '2025-10-19',
    open: '10:00',
    close: '14:00',
  },
];
