import { Dayjs } from 'dayjs';

export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface Slot {
  id: string;
  start: Dayjs;
  end: Dayjs;
  available: string[];
}

export interface User {
  id: string;
  firstName: string;
}

export interface Appointment {
  id: string;
  _id?: string;
  date: string;
  employee?: User | any; // Some APIs return nested, some flat
  client?: User | any;
  start: string;
  end?: string;
  duration?: number;
  status: 'scheduled' | 'cancelled' | 'attended' | 'not-attended' | 'checked-in' | 'completed' | string;
  service: string;
  customerName?: string;
  customerEmail?: string;
}



export interface Schedule {
  _id: string;
  id?: string; // Some parts of the app use id instead of _id
  date: string;
  open: string;
  close: string;
  appointments: Appointment[];
}

export interface RouteError {
  statusText?: string;
  message?: string;
}

export interface Employee {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  bio?: string;
  image?: string;
  profile?: string;
}
