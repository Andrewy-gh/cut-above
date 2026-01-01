import { AppointmentService, UserRole } from '../types/index.js';
import { findById } from '../services/userService.js';

// req.body from client:
// {
//   date: '2024-02-02',
//   start: '17:30',
//   end: '18:00',
//   service: 'Haircut',
//   employee: '64a60e878bdf8a4ac0f98209'
// }
const services: AppointmentService[] = [
  'Haircut',
  'Beard Trim',
  'Straight Razor Shave',
  'Cut and Shave Package',
  'The Full Package',
];

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

const parseString = (string: unknown): string => {
  if (!isString(string)) {
    throw new Error('Incorrect or missing field');
  }
  return string;
};

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

const parseDate = (date: unknown): string => {
  if (!isString(date) || !isDate(date)) {
    throw new Error('Incorrect date: ' + date);
  }
  return date;
};

const isValidTime = (timeString: string): boolean => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Matches HH:MM format
  return regex.test(timeString);
};

const parseTime = (timeString: unknown): string => {
  if (!parseString(timeString) || !isValidTime(timeString)) {
    throw new Error('Incorrect or missing time');
  }
  return timeString;
};

const isService = (service: string): service is AppointmentService => {
  return services.includes(service as AppointmentService);
};

const parseService = (service: unknown): AppointmentService => {
  if (!parseString(service) || !isService(service)) {
    throw new Error('Incorrect or missing service');
  }
  return service;
};

const parseUser = async (userId: unknown, role: UserRole): Promise<string> => {
  const user = await findById(parseString(userId));
  if (!user || user?.role !== role) {
    throw new Error('Incorrect or missing user id');
  }
  // return the user id just to book instead of the database object
  return user.id;
};

interface ValidatedAppointment {
  date: string;
  clientId: string;
  start: string;
  end: string;
  service: AppointmentService;
  employeeId: string;
}

export const validateNewRequest = async (object: unknown): Promise<ValidatedAppointment> => {
  if (!object || typeof object !== 'object') {
    throw new Error('Incorrect or missing data');
  }

  const obj = object as Record<string, unknown>;

  if (
    'date' in obj &&
    'clientId' in obj &&
    'start' in obj &&
    'end' in obj &&
    'service' in obj &&
    'employeeId' in obj
  ) {
    const newAppointment: ValidatedAppointment = {
      date: parseDate(obj.date),
      clientId: await parseUser(obj.clientId, 'client'),
      start: parseTime(obj.start),
      end: parseTime(obj.end),
      service: parseService(obj.service),
      employeeId: await parseUser(obj.employeeId, 'employee'),
    };
    return newAppointment;
  }
  throw new Error('Incorrect data: a field missing');
};
