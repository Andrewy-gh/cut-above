import crypto from 'crypto';
import { users, appointments, schedules } from './data.js';
import {
  Appointment,
  PasswordResetToken,
  User,
  Schedule,
} from '../models/index.js';
import logger from './logger/index.js';
import { sequelize } from './db.js';
import { convertISOToDate } from './dateTime.js';

export const seedUsers = async (): Promise<User[]> => {
  const newUsers = await User.bulkCreate(users, { returning: true });
  logger.info('new users created');
  logger.info(
    JSON.stringify(
      newUsers.map((u) => ({ id: u.id, email: u.email, role: u.role }))
    )
  );
  return newUsers;
};

export const seedSchedules = async (): Promise<Schedule[]> => {
  const schedulesWithFormattedDates = schedules.map((schedule) => ({
    open: convertISOToDate(schedule.open),
    close: convertISOToDate(schedule.close),
  }));

  const newSchedules = await Schedule.bulkCreate(schedulesWithFormattedDates, {
    returning: true,
  });
  logger.info('new schedules created');
  logger.info(
    JSON.stringify(newSchedules.map((s) => ({ id: s.id, open: s.open, close: s.close })))
  );
  return newSchedules;
};

export const seedAppointments = async (
  users: User[],
  schedules: Schedule[]
): Promise<Appointment[]> => {
  const clients = users.filter((u) => u.role === 'client');
  const employees = users.filter((u) => u.role === 'employee');

  const appointmentsWithFK = appointments.map((appointment, index) => {
    const client = clients[index % clients.length];
    const employee = employees[index % employees.length];
    const schedule =
      schedules.length > 0 ? schedules[index % schedules.length] : null;

    return {
      service: appointment.service,
      status: appointment.status,
      clientId: client.id,
      employeeId: employee.id,
      scheduleId: schedule!.id,
      start: convertISOToDate(appointment.start),
      end: convertISOToDate(appointment.end),
    };
  });

  const newAppointments = await Appointment.bulkCreate(appointmentsWithFK, {
    returning: true,
  });
  logger.info('new appointments created');
  logger.info(
    JSON.stringify(
      newAppointments.map((a) => ({
        id: a.id,
        start: a.start,
        service: a.service,
        status: a.status,
      }))
    )
  );
  return newAppointments;
};

export const seedTokens = async (users: User[]): Promise<PasswordResetToken[]> => {
  const clients = users.filter((u) => u.role === 'client');

  const tokens = clients.map((client) => ({
    tokenHash: crypto.randomBytes(32).toString('hex'),
    userId: client.id,
  }));

  const newTokens = await PasswordResetToken.bulkCreate(tokens, {
    returning: true,
  });
  logger.info('new tokens created');
  logger.info(
    JSON.stringify(newTokens.map((t) => ({ id: t.id, userId: t.userId })))
  );
  return newTokens;
};

export const createTables = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: true });
    logger.info('All tables created successfully');
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
};

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Connected to the database');

    logger.info('Creating tables...');
    await createTables();

    logger.info('Starting to seed users');
    const _seededUsers = await seedUsers();
    logger.info('Users seeded successfully');

    logger.info('Starting to seed schedules');
    const _seededSchedules = await seedSchedules();
    logger.info('Schedules seeded successfully');

    logger.info('Starting to seed appointments');
    await seedAppointments(_seededUsers, _seededSchedules);
    logger.info('Appointments seeded successfully');

    logger.info('Starting to seed password reset tokens');
    await seedTokens(_seededUsers);
    logger.info('Tokens seeded successfully');

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('An error occurred while seeding the database:', error);
  } finally {
    try {
      await sequelize.close();
      logger.info('Database connection closed');
    } catch (closeError) {
      logger.error('Error closing the database connection:', closeError);
    }
  }
}

main().catch((err) => {
  logger.error('An error occurred while attempting to seed the database:', err);
});
