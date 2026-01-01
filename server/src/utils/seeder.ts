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
import { convertDateAndTime, convertDate } from './dateTime.js';

interface SeededUser {
  id: string;
  email: string;
  role: string;
}

interface SeededSchedule {
  id: string;
  date: Date;
}

export const seedUsers = async (): Promise<any[]> => {
  const newUsers = await User.bulkCreate(users, { returning: true });
  logger.info('new users created');
  logger.info(
    JSON.stringify(
      newUsers.map((u: any) => ({ id: u.id, email: u.email, role: u.role }))
    )
  );
  return newUsers;
};

export const seedSchedules = async (): Promise<any[]> => {
  const schedulesWithFormattedDates = schedules.map((schedule) => ({
    ...schedule,
    date: convertDate(schedule.date),
    open: convertDateAndTime(schedule.date, schedule.open),
    close: convertDateAndTime(schedule.date, schedule.close),
  }));

  const newSchedules = await Schedule.bulkCreate(schedulesWithFormattedDates, {
    returning: true,
  });
  logger.info('new schedules created');
  logger.info(
    JSON.stringify(newSchedules.map((s: any) => ({ id: s.id, date: s.date })))
  );
  return newSchedules;
};

export const seedAppointments = async (
  users: any[],
  schedules: any[]
): Promise<any[]> => {
  const clients = users.filter((u) => u.role === 'client');
  const employees = users.filter((u) => u.role === 'employee');

  const appointmentsWithFK = appointments.map((appointment, index) => {
    const client = clients[index % clients.length];
    const employee = employees[index % employees.length];
    const schedule =
      schedules.length > 0 ? schedules[index % schedules.length] : null;

    return {
      ...appointment,
      clientId: client.id,
      employeeId: employee.id,
      scheduleId: schedule ? schedule.id : null,
      date: convertDate(appointment.date),
      start: convertDateAndTime(appointment.date, appointment.start),
      end: convertDateAndTime(appointment.date, appointment.end),
    };
  });

  const newAppointments = await Appointment.bulkCreate(appointmentsWithFK, {
    returning: true,
  });
  logger.info('new appointments created');
  logger.info(
    JSON.stringify(
      newAppointments.map((a: any) => ({
        id: a.id,
        date: a.date,
        service: a.service,
        status: a.status,
      }))
    )
  );
  return newAppointments;
};

export const seedTokens = async (users: any[]): Promise<any[]> => {
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
    JSON.stringify(newTokens.map((t: any) => ({ id: t.id, userId: t.userId })))
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
    const seededUsers = await seedUsers();
    logger.info('Users seeded successfully');

    logger.info('Starting to seed schedules');
    const seededSchedules = await seedSchedules();
    logger.info('Schedules seeded successfully');

    logger.info('Starting to seed appointments');
    const seededAppointments = await seedAppointments(
      seededUsers,
      seededSchedules
    );
    logger.info('Appointments seeded successfully');

    logger.info('Starting to seed password reset tokens');
    const seededTokens = await seedTokens(seededUsers);
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
