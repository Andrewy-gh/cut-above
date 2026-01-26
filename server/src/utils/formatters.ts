import { formatDateSlashISO, formatTimeISO } from "./dateTime.js";
import { generateAppointmentLink } from "./emailOptions.js";
import type { AppointmentService } from "../types/index.js";

type EmailOption =
  | "confirmation"
  | "modification"
  | "cancellation"
  | "reset password"
  | "reset password success"
  | "message auto reply"
  | "message submission";

interface EmailAppointmentInput {
  start: string; // ISO datetime
  end: string; // ISO datetime
  service: AppointmentService;
  employee: {
    id: string;
    firstName: string;
  };
  id: string;
  option: EmailOption;
}

export const formatEmail = (appointment: EmailAppointmentInput) => {
  return {
    date: formatDateSlashISO(appointment.start),
    time: formatTimeISO(appointment.start),
    employee: appointment.employee.firstName,
    option: appointment.option,
    emailLink: generateAppointmentLink(appointment.id),
  };
};
