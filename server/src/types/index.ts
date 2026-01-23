// Shared types and enums

// User related types
export type UserRole = 'client' | 'employee' | 'admin';

// Appointment related types
export type AppointmentService =
  | 'Haircut'
  | 'Beard Trim'
  | 'Straight Razor Shave'
  | 'Cut and Shave Package'
  | 'The Full Package';

export type AppointmentStatus = 'scheduled' | 'checked-in' | 'completed' | 'no show';

export interface NewAppointmentData {
  start: string; // ISO datetime (e.g., "2024-01-22T17:00:00.000Z")
  end: string; // ISO datetime (e.g., "2024-01-22T17:30:00.000Z")
  service: AppointmentService;
  clientId: string;
  employeeId: string;
}

export interface UpdateAppointmentData {
  id: string;
  start?: string; // ISO datetime (e.g., "2024-01-22T17:00:00.000Z")
  end?: string; // ISO datetime (e.g., "2024-01-22T17:30:00.000Z")
  service?: AppointmentService;
  status?: AppointmentStatus;
  employeeId?: string;
}

// Generic types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
