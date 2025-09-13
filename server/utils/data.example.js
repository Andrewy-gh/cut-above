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
    image: '/src/assets/images/andre.webp',
    profile:
      'Andre has honed his skills and techniques to deliver top-notch grooming services. In his free time, Andre enjoys exploring the outdoors and staying active. He loves hiking, running, and playing sports, and is always up for a new adventure.',
  },
  {
    firstName: 'Obi',
    lastName: 'M',
    email: 'obi@cutaboveshop.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'employee',
    image: '/src/assets/images/obi.webp',
    profile:
      'Meet Obi, our skilled and talented barber who is dedicated to providing his clients with top-notch grooming services. He loves to travel and discover new cultures, and is always planning his next adventure.',
  },
  {
    firstName: 'Salah',
    lastName: 'R',
    email: 'salah@cutabove.com',
    passwordHash: bcrypt.hashSync('Strongpassword123!', 10),
    role: 'employee',
    image: '/src/assets/images/salah.webp',
    profile:
      'With a natural talent for hair cutting and styling, Salah takes pride in helping his clients achieve the perfect look. In his free time, Salah enjoys painting and drawing, and is always attending concerts.  He is a big fan of classic rock and jazz.',
  },
];

export const appointments = [
  {
    date: '2024-01-22',
    start: '17:00',
    end: '17:30',
  },
  {
    date: '2024-01-23',
    start: '14:00',
    end: '14:30',
  },
  {
    date: '2024-01-24',
    start: '10:00',
    end: '10:30',
  },
  {
    date: '2022-01-24',
    start: '13:00',
    end: '13:30',
  },
];
