import { formatDateSlash, formatTime } from './dateTime.js';
import { generateAppointmentLink } from './emailOptions.js';
import type { AppointmentService } from '../types/index.js';

type EmailOption =
  | 'confirmation'
  | 'modification'
  | 'cancellation'
  | 'reset password'
  | 'reset password success'
  | 'message auto reply'
  | 'message submission';

interface AppointmentInput {
  date: string;
  start: string;
  end: string;
  service: AppointmentService;
  employee: {
    id: string;
    firstName: string;
  };
}

interface EmailAppointmentInput extends AppointmentInput {
  id: string;
  option: EmailOption;
}

interface FormattedAppointment {
  date: string;
  start: string;
  end: string;
  service: AppointmentService;
  employeeId: string;
}

interface FormattedEmail {
  date: string;
  time: string;
  employee: string;
  option: EmailOption;
  emailLink: string;
}

export const formatAppt = (appointment: AppointmentInput): FormattedAppointment => ({
  date: appointment.date,
  start: appointment.start,
  end: appointment.end,
  service: appointment.service,
  employeeId: appointment.employee.id,
});

export const formatEmail = (appointment: EmailAppointmentInput): FormattedEmail => {
  if (appointment.option === 'cancellation') {
    return {
      date: formatDateSlash(appointment.date),
      time: formatTime(appointment.start),
      employee: appointment.employee.firstName,
      option: appointment.option,
      emailLink: generateAppointmentLink(appointment.id),
    };
  }
  return {
    date: formatDateSlash(appointment.date),
    time: formatTime(appointment.start),
    employee: appointment.employee.firstName,
    option: appointment.option,
    emailLink: generateAppointmentLink(appointment.id),
  };
};
