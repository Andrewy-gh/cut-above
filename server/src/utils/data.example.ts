import bcrypt from "bcrypt";

import {
  UserRole,
  AppointmentService,
  AppointmentStatus,
} from "../types/index.js";

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  image?: string;
  profile?: string;
}

interface SeedAppointment {
  date: string;
  start: string;
  end: string;
  service: AppointmentService;
  status: AppointmentStatus;
}

interface SeedSchedule {
  date: string;
  open: string;
  close: string;
}

export const users: SeedUser[] = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "admin",
  },
  {
    firstName: "First",
    lastName: "User",
    email: "user1@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Second",
    lastName: "User",
    email: "user2@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Third",
    lastName: "User",
    email: "user3@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Andre",
    lastName: "S",
    email: "andre@cutaboveshop.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "employee",
    // image: insert image url
    profile:
      "Andre has honed his skills and techniques to deliver top-notch grooming services. In his free time, Andre enjoys exploring the outdoors and staying active. He loves hiking, running, and playing sports, and is always up for a new adventure.",
  },
  {
    firstName: "Obi",
    lastName: "M",
    email: "obi@cutaboveshop.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "employee",
    // image: insert image url
    profile:
      "Meet Obi, our skilled and talented barber who is dedicated to providing his clients with top-notch grooming services. He loves to travel and discover new cultures, and is always planning his next adventure.",
  },
  {
    firstName: "Salah",
    lastName: "R",
    email: "salah@cutabove.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "employee",
    // image: insert image url
    profile:
      "With a natural talent for hair cutting and styling, Salah takes pride in helping his clients achieve the perfect look. In his free time, Salah enjoys painting and drawing, and is always attending concerts.  He is a big fan of classic rock and jazz.",
  },
  // Additional clients
  {
    firstName: "John",
    lastName: "Smith",
    email: "johnsmith@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Emily",
    lastName: "Johnson",
    email: "emilyj@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    email: "michaelb@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "Sarah",
    lastName: "Davis",
    email: "sarahd@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
  {
    firstName: "David",
    lastName: "Wilson",
    email: "davidw@email.com",
    passwordHash: bcrypt.hashSync("Strongpassword123!", 10),
    role: "client",
  },
];

// Services that can be booked
export const services: AppointmentService[] = [
  "Haircut",
  "Beard Trim",
  "Straight Razor Shave",
  "Cut and Shave Package",
  "The Full Package",
];

// Statuses for appointments
export const appointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "checked-in",
  "completed",
  "no show",
];

export const appointments: SeedAppointment[] = [
  {
    date: "2024-01-22",
    start: "17:00",
    end: "17:30",
    service: "Haircut",
    status: "completed",
  },
  {
    date: "2024-01-23",
    start: "14:00",
    end: "14:30",
    service: "Beard Trim",
    status: "completed",
  },
  {
    date: "2024-01-24",
    start: "10:00",
    end: "10:30",
    service: "Haircut",
    status: "completed",
  },
  {
    date: "2022-01-24",
    start: "13:00",
    end: "13:30",
    service: "The Full Package",
    status: "no show",
  },
  // Future appointments
  {
    date: "2025-10-20",
    start: "09:00",
    end: "09:30",
    service: "Haircut",
    status: "scheduled",
  },
  {
    date: "2025-10-20",
    start: "10:00",
    end: "10:45",
    service: "The Full Package",
    status: "scheduled",
  },
  {
    date: "2025-10-21",
    start: "11:00",
    end: "11:30",
    service: "Beard Trim",
    status: "scheduled",
  },
  {
    date: "2025-10-21",
    start: "14:00",
    end: "14:45",
    service: "Cut and Shave Package",
    status: "scheduled",
  },
  {
    date: "2025-10-22",
    start: "13:00",
    end: "13:30",
    service: "Haircut",
    status: "scheduled",
  },
  {
    date: "2025-10-23",
    start: "15:00",
    end: "15:30",
    service: "Straight Razor Shave",
    status: "scheduled",
  },
  {
    date: "2025-10-24",
    start: "10:00",
    end: "10:30",
    service: "Haircut",
    status: "scheduled",
  },
  {
    date: "2025-10-27",
    start: "09:00",
    end: "09:45",
    service: "Cut and Shave Package",
    status: "scheduled",
  },
  {
    date: "2025-10-28",
    start: "14:00",
    end: "14:30",
    service: "Beard Trim",
    status: "scheduled",
  },
  {
    date: "2025-10-29",
    start: "11:00",
    end: "12:00",
    service: "The Full Package",
    status: "scheduled",
  },
  {
    date: "2025-10-30",
    start: "10:00",
    end: "10:30",
    service: "Haircut",
    status: "scheduled",
  },
  {
    date: "2025-10-31",
    start: "13:00",
    end: "13:15",
    service: "Straight Razor Shave",
    status: "scheduled",
  },
];

// Schedule data for the barbershop
export const schedules: SeedSchedule[] = [
  {
    date: "2025-10-17",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-18",
    open: "09:00",
    close: "15:00",
  },
  {
    date: "2025-10-19",
    open: "10:00",
    close: "14:00",
  },
  {
    date: "2025-10-20",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-21",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-22",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-23",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-24",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-25",
    open: "09:00",
    close: "15:00",
  },
  {
    date: "2025-10-26",
    open: "10:00",
    close: "14:00",
  },
  {
    date: "2025-10-27",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-28",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-29",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-30",
    open: "08:00",
    close: "17:00",
  },
  {
    date: "2025-10-31",
    open: "08:00",
    close: "17:00",
  },
];
