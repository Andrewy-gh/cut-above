import { Dayjs } from "dayjs";

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
  date?: string;
  employee?: User | string; // Can be User object (populated) or string ID
  client?: User | string; // Can be User object (populated) or string ID
  start: string;
  end?: string;
  duration?: number;
  status:
    | "scheduled"
    | "cancelled"
    | "attended"
    | "not-attended"
    | "checked-in"
    | "completed"
    | string;
  service: string;
  customerName?: string;
  customerEmail?: string;
}

export interface Schedule {
  id: string;
  date?: string;
  open: string;
  close: string;
  appointments: Appointment[];
}

export interface RouteError {
  statusText?: string;
  message?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  bio?: string;
  image?: string;
  profile?: string;
}

export interface EmployeeProfile {
  id: string;
  firstName: string;
  image: string;
  profile: string;
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  image: string;
  description: string;
}

export interface NavLink {
  id: number;
  name: string;
  path: string;
}

export interface AppointmentStatusGroup {
  id: number;
  name: string;
  data: Appointment[];
}

export interface InvalidParam {
  name: string;
  reason?: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  code?: string;
  invalidParams?: InvalidParam[];
}

export type ApiError =
  | ProblemDetails
  | {
      data?: unknown;
      status?: number | string;
      error?: string;
      message?: string;
    };
