import { UserRole, AppointmentService, AppointmentStatus } from './index.js';

// User model interfaces
export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  image?: string;
  profile?: string;
}

export interface UserCreationAttributes {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  image?: string;
  profile?: string;
}

// Appointment model interfaces
export interface AppointmentAttributes {
  id: string;
  date: Date;
  start: Date;
  end: Date;
  service: AppointmentService;
  status: AppointmentStatus;
  clientId: string;
  employeeId: string;
  scheduleId: string;
}

export interface AppointmentCreationAttributes {
  date: Date;
  start: Date;
  end: Date;
  service: AppointmentService;
  status?: AppointmentStatus;
  clientId: string;
  employeeId: string;
  scheduleId: string;
}

// Schedule model interfaces
export interface ScheduleAttributes {
  id: string;
  date: Date;
  open: Date;
  close: Date;
}

export interface ScheduleCreationAttributes {
  date: Date;
  open: Date;
  close: Date;
}

// PasswordResetToken model interfaces
export interface PasswordResetTokenAttributes {
  id: string;
  tokenHash: string;
  timesUsed: number;
  expiresAt: Date;
  userId: string;
}

export interface PasswordResetTokenCreationAttributes {
  tokenHash: string;
  timesUsed?: number;
  expiresAt?: Date;
  userId: string;
}
