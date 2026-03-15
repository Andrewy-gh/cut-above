import { Dayjs } from "dayjs";

import type { AppointmentStatus, ServiceName } from "@cut-above/shared";

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

export interface EmployeeAvailabilityWindow {
  employeeId: string;
  start: string;
  end: string;
}

export interface EmployeeBreakWindow extends EmployeeAvailabilityWindow {
  id: string;
  label?: string;
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
}

export interface Appointment {
  id: string;
  date?: string;
  employee?: User | string; // Can be User object (populated) or string ID
  client?: User | string; // Can be User object (populated) or string ID
  start: string;
  end?: string;
  duration?: number;
  status: AppointmentStatus | "attended" | "not-attended" | string;
  service: ServiceName | string;
  customerName?: string;
  customerEmail?: string;
}

export interface Schedule {
  id: string;
  date?: string;
  open: string;
  close: string;
  employeeAvailability?: EmployeeAvailabilityWindow[];
  employeeBreaks?: EmployeeBreakWindow[];
  appointments: Appointment[];
}

export interface ScheduleAppointmentStatusCounts {
  scheduled: number;
  'checked-in': number;
  completed: number;
}

export interface ScheduleSummary {
  id: string;
  date?: string;
  open: string;
  close: string;
  appointmentCount: number;
  appointmentStatusCounts: ScheduleAppointmentStatusCounts;
}

export interface EmployeeAvailabilityWeeklyEntry {
  weekday: Weekday;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

export interface EmployeeAvailabilityOverride {
  id: string;
  date: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface EmployeeAvailabilityBreak {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  label?: string;
}

export interface EmployeeAvailabilityDateBreak {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
}

export interface EmployeeAvailabilityDateBreakPolicy {
  date: string;
  mode: 'add' | 'replace';
}

export interface EmployeeAvailabilityResponse {
  employee: User & { lastName?: string };
  defaultHours: {
    startTime: string;
    endTime: string;
  };
  weekly: EmployeeAvailabilityWeeklyEntry[];
  overrides: EmployeeAvailabilityOverride[];
  breaks: EmployeeAvailabilityBreak[];
  dateBreaks: EmployeeAvailabilityDateBreak[];
  dateBreakPolicies: EmployeeAvailabilityDateBreakPolicy[];
}

export interface EmployeeAvailabilitySummaryItem {
  id: string;
  firstName: string;
  lastName?: string;
  availabilityWindow: EmployeeAvailabilityWindow | null;
  breaks: EmployeeBreakWindow[];
  breakMode: 'add' | 'replace';
  appointmentCount: number;
}

export interface EmployeeAvailabilitySummaryResponse {
  date: string;
  schedule: {
    id: string;
    open: string;
    close: string;
  } | null;
  employees: EmployeeAvailabilitySummaryItem[];
}

export interface EmployeeAvailabilitySummaryRangeResponse {
  startDate: string;
  endDate: string;
  days: EmployeeAvailabilitySummaryResponse[];
}

export interface RouteError {
  statusText?: string;
  message?: string;
}

export type Employee = User;

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
