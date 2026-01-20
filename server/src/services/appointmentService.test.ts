import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sequelize } from '../utils/db.js';
import { update } from './appointmentService.js';
import { Appointment, User, Schedule } from '../models/index.js';

describe('appointmentService - Transaction Rollback', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('update - Must-Fix #4: Transaction Rollback Guarantee', () => {
    it('rolls back schedule change if appointment.save() fails', async () => {
      // Setup: Create test user, schedules, and appointment
      const client = await User.create({
        firstName: 'Test',
        lastName: 'Client',
        email: 'client@test.com',
        passwordHash: 'hash',
        role: 'client',
      });

      const employee = await User.create({
        firstName: 'Test',
        lastName: 'Employee',
        email: 'employee@test.com',
        passwordHash: 'hash',
        role: 'employee',
      });

      const schedule1 = await Schedule.create({
        date: new Date('2024-01-22'),
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      });

      const schedule2 = await Schedule.create({
        date: new Date('2024-01-23'),
        open: new Date('2024-01-23T14:00:00.000Z'),
        close: new Date('2024-01-23T22:00:00.000Z'),
      });

      const appointment = await Appointment.create({
        date: new Date('2024-01-22'),
        start: new Date('2024-01-22T17:00:00.000Z'),
        end: new Date('2024-01-22T17:30:00.000Z'),
        service: 'Haircut',
        status: 'scheduled',
        clientId: client.id,
        employeeId: employee.id,
        scheduleId: schedule1.id,
      });

      const originalScheduleId = appointment.scheduleId;

      // Mock appointment.save() to throw error after schedule.removeAppointment()
      const saveSpy = vi.spyOn(appointment, 'save').mockRejectedValueOnce(
        new Error('Simulated save failure')
      );

      // Attempt update that changes date (triggers transaction)
      try {
        await update({
          id: appointment.id,
          start: '2024-01-23T17:00:00.000Z', // Different date
          end: '2024-01-23T17:30:00.000Z',
          service: 'Haircut',
          employeeId: employee.id,
        });
      } catch (error) {
        // Expected error
        expect((error as Error).message).toBe('Simulated save failure');
      }

      // Verify rollback: appointment should still have original scheduleId
      const unchangedAppt = await Appointment.findByPk(appointment.id);
      expect(unchangedAppt?.scheduleId).toBe(originalScheduleId);

      // Verify rollback: schedule1 should still have the appointment
      const schedule1Appts = await schedule1.getAppointments();
      expect(schedule1Appts).toHaveLength(1);
      expect(schedule1Appts[0].id).toBe(appointment.id);

      // Verify rollback: schedule2 should NOT have the appointment
      const schedule2Appts = await schedule2.getAppointments();
      expect(schedule2Appts).toHaveLength(0);

      saveSpy.mockRestore();
    });

    it('commits transaction successfully when all operations succeed', async () => {
      // Setup
      const client = await User.create({
        firstName: 'Test',
        lastName: 'Client',
        email: 'client2@test.com',
        passwordHash: 'hash',
        role: 'client',
      });

      const employee = await User.create({
        firstName: 'Test',
        lastName: 'Employee',
        email: 'employee2@test.com',
        passwordHash: 'hash',
        role: 'employee',
      });

      const schedule1 = await Schedule.create({
        date: new Date('2024-01-22'),
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      });

      const schedule2 = await Schedule.create({
        date: new Date('2024-01-23'),
        open: new Date('2024-01-23T14:00:00.000Z'),
        close: new Date('2024-01-23T22:00:00.000Z'),
      });

      const appointment = await Appointment.create({
        date: new Date('2024-01-22'),
        start: new Date('2024-01-22T17:00:00.000Z'),
        end: new Date('2024-01-22T17:30:00.000Z'),
        service: 'Haircut',
        status: 'scheduled',
        clientId: client.id,
        employeeId: employee.id,
        scheduleId: schedule1.id,
      });

      // Update to different date (should succeed)
      const updated = await update({
        id: appointment.id,
        start: '2024-01-23T17:00:00.000Z',
        end: '2024-01-23T17:30:00.000Z',
        service: 'Haircut',
        employeeId: employee.id,
      });

      // Verify commit: appointment has new scheduleId
      expect(updated.scheduleId).toBe(schedule2.id);
      expect(updated.scheduleId).not.toBe(schedule1.id);

      // Verify commit: schedule1 no longer has appointment
      const schedule1Appts = await schedule1.getAppointments();
      expect(schedule1Appts).toHaveLength(0);

      // Verify commit: schedule2 now has appointment
      const schedule2Appts = await schedule2.getAppointments();
      expect(schedule2Appts).toHaveLength(1);
      expect(schedule2Appts[0].id).toBe(appointment.id);
    });
  });
});
