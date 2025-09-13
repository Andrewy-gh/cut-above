import crypto from 'crypto';
import { users, appointments, schedules } from './data.js';
import { Appointment, PasswordResetToken, User, Schedule } from '../models/index.js';
import logger from './logger/index.js';
import { sequelize } from './db.js';
import { convertDateAndTime, convertDate } from './dateTime.js';

export const seedUsers = async () => {
  const newUsers = await User.bulkCreate(users, { returning: true });
  logger.info('new users created');
  logger.info(JSON.stringify(newUsers.map(u => ({ id: u.id, email: u.email, role: u.role }))));
  return newUsers;
};

export const seedSchedules = async () => {
  // Convert schedule data to proper format
  const schedulesWithFormattedDates = schedules.map(schedule => ({
    ...schedule,
    date: convertDate(schedule.date),
    open: convertDateAndTime(schedule.date, schedule.open),
    close: convertDateAndTime(schedule.date, schedule.close),
  }));
  
  const newSchedules = await Schedule.bulkCreate(schedulesWithFormattedDates, { returning: true });
  logger.info('new schedules created');
  logger.info(JSON.stringify(newSchedules.map(s => ({ id: s.id, date: s.date }))));
  return newSchedules;
};

export const seedAppointments = async (users, schedules) => {
  // Map users by role for easier assignment
  const clients = users.filter(u => u.role === 'client');
  const employees = users.filter(u => u.role === 'employee');
  
  // Add foreign keys to appointments
  const appointmentsWithFK = appointments.map((appointment, index) => {
    // Assign a client (round-robin)
    const client = clients[index % clients.length];
    // Assign an employee (round-robin)
    const employee = employees[index % employees.length];
    // Assign a schedule (if we have schedules)
    const schedule = schedules.length > 0 ? schedules[index % schedules.length] : null;
    
    return {
      ...appointment,
      clientId: client.id,
      employeeId: employee.id,
      scheduleId: schedule ? schedule.id : null,
      // Convert date and time strings to proper Date objects
      date: convertDate(appointment.date),
      start: convertDateAndTime(appointment.date, appointment.start),
      end: convertDateAndTime(appointment.date, appointment.end),
    };
  });
  
  const newAppointments = await Appointment.bulkCreate(appointmentsWithFK, { returning: true });
  logger.info('new appointments created');
  logger.info(JSON.stringify(newAppointments.map(a => ({ id: a.id, date: a.date, service: a.service, status: a.status }))));
  return newAppointments;
};

export const seedTokens = async (users) => {
  // Create tokens for clients only
  const clients = users.filter(u => u.role === 'client');
  
  const tokens = clients.map(client => ({
    tokenHash: crypto.randomBytes(32).toString('hex'),
    userId: client.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  }));
  
  const newTokens = await PasswordResetToken.bulkCreate(tokens, { returning: true });
  logger.info('new tokens created');
  logger.info(JSON.stringify(newTokens.map(t => ({ id: t.id, userId: t.userId }))));
  return newTokens;
};

export const createTables = async () => {
  try {
    // Sync all models to create tables
    await sequelize.sync({ force: true }); // This will drop and recreate all tables
    logger.info('All tables created successfully');
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
};

async function main() {
  try {
    await sequelize.authenticate();
    logger.info('Connected to the database');
    
    // Create all tables
    logger.info('Creating tables...');
    await createTables();
    
    // Seed users first
    logger.info('Starting to seed users');
    const seededUsers = await seedUsers();
    logger.info('Users seeded successfully');
    
    // Seed schedules
    logger.info('Starting to seed schedules');
    const seededSchedules = await seedSchedules();
    logger.info('Schedules seeded successfully');
    
    // Seed appointments (requires users and schedules)
    logger.info('Starting to seed appointments');
    const seededAppointments = await seedAppointments(seededUsers, seededSchedules);
    logger.info('Appointments seeded successfully');
    
    // Seed tokens (requires users)
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
