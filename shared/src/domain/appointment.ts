export const SERVICE_NAMES = [
  "Haircut",
  "Beard Trim",
  "Straight Razor Shave",
  "Cut and Shave Package",
  "The Full Package",
] as const;

export type ServiceName = (typeof SERVICE_NAMES)[number];

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "cancelled",
  "checked-in",
  "completed",
  "no show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
