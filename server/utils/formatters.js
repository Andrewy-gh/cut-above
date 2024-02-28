import { formatDateSlash, formatTime } from './dateTime.js';
import { generateAppointmentLink } from './emailOptions.js';

export const formatAppt = (appointment) => ({
  date: appointment.date,
  start: appointment.start,
  end: appointment.end,
  service: appointment.service,
  employeeId: appointment.employee.id,
});

export const formatEmail = (appointment) => {
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
