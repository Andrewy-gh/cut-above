import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sequelize } from '../utils/db.js';
import { getAppointmentsByRole, update } from './appointmentService.js';
import { Appointment, User, Schedule } from '../models/index.js';

describe('appointmentService', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await sequelize.sync({ force: true });
  });

  describe('getAppointmentsByRole', () => {
    it('dispatches to client appointments with expected query shape', async () => {
      const getAppointments = vi.fn().mockResolvedValue(['client-result']);
      const user = { role: 'client', getAppointments } as unknown as User;

      const result = await getAppointmentsByRole(user);

      expect(result.status).toBe('ok');
      if (result.status !== 'ok') throw new Error('Expected Ok result');
      expect(result.value).toEqual(['client-result']);
      expect(getAppointments).toHaveBeenCalledTimes(1);

      const [options] = getAppointments.mock.calls[0];
      expect(options.attributes.exclude).toEqual([
        'clientId',
        'employeeId',
        'scheduleId',
        'end',
        'status',
      ]);
      expect(options.include).toHaveLength(1);
      expect(options.include[0].as).toBe('employee');
      expect(options.include[0].attributes.exclude).toEqual([
        'passwordHash',
        'image',
        'profile',
        'lastName',
        'role',
        'email',
      ]);
    });

    it('dispatches to employee appointments with expected query shape', async () => {
      const getEmployeeAppointments = vi.fn().mockResolvedValue(['employee-result']);
      const user = {
        role: 'employee',
        getEmployeeAppointments,
      } as unknown as User;

      const result = await getAppointmentsByRole(user);

      expect(result.status).toBe('ok');
      if (result.status !== 'ok') throw new Error('Expected Ok result');
      expect(result.value).toEqual(['employee-result']);
      expect(getEmployeeAppointments).toHaveBeenCalledTimes(1);

      const [options] = getEmployeeAppointments.mock.calls[0];
      expect(options.attributes.exclude).toEqual(['clientId', 'employeeId']);
      expect(options.include).toHaveLength(1);
      expect(options.include[0].as).toBe('client');
      expect(options.include[0].attributes.exclude).toEqual([
        'passwordHash',
        'image',
        'profile',
        'lastName',
        'role',
        'email',
      ]);
    });

    it('returns empty list for unsupported roles', async () => {
      const user = { role: 'admin' } as unknown as User;

      const result = await getAppointmentsByRole(user);
      expect(result.status).toBe('ok');
      if (result.status !== 'ok') throw new Error('Expected Ok result');
      expect(result.value).toEqual([]);
    });

    it('omits passwordHash from included users', async () => {
      const client = await User.create({
        firstName: 'Test',
        lastName: 'Client',
        email: 'client3@test.com',
        passwordHash: 'hash',
        role: 'client',
      });

      const employee = await User.create({
        firstName: 'Test',
        lastName: 'Employee',
        email: 'employee3@test.com',
        passwordHash: 'hash',
        role: 'employee',
      });

      const schedule = await Schedule.create({
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      });

      await Appointment.create({
        start: new Date('2024-01-22T17:00:00.000Z'),
        end: new Date('2024-01-22T17:30:00.000Z'),
        service: 'Haircut',
        status: 'scheduled',
        clientId: client.id,
        employeeId: employee.id,
        scheduleId: schedule.id,
      });

      const clientResult = await getAppointmentsByRole(client);
      if (clientResult.status !== 'ok') throw new Error('Expected Ok result');
      const [clientView] = clientResult.value;
      const clientEmployee = (clientView as Appointment & { employee?: User }).employee;
      expect(clientEmployee).toBeTruthy();
      expect(clientEmployee?.passwordHash).toBeUndefined();
      expect(clientEmployee?.dataValues).not.toHaveProperty('passwordHash');

      const employeeResult = await getAppointmentsByRole(employee);
      if (employeeResult.status !== 'ok') throw new Error('Expected Ok result');
      const [employeeView] = employeeResult.value;
      const employeeClient = (employeeView as Appointment & { client?: User }).client;
      expect(employeeClient).toBeTruthy();
      expect(employeeClient?.passwordHash).toBeUndefined();
      expect(employeeClient?.dataValues).not.toHaveProperty('passwordHash');
    });
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
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      });

      const schedule2 = await Schedule.create({
        open: new Date('2024-01-23T14:00:00.000Z'),
        close: new Date('2024-01-23T22:00:00.000Z'),
      });

      const appointment = await Appointment.create({
        start: new Date('2024-01-22T17:00:00.000Z'),
        end: new Date('2024-01-22T17:30:00.000Z'),
        service: 'Haircut',
        status: 'scheduled',
        clientId: client.id,
        employeeId: employee.id,
        scheduleId: schedule1.id,
      });

      const originalScheduleId = appointment.scheduleId;

      // Mock Appointment.prototype.save to throw error on next call
      const saveSpy = vi.spyOn(Appointment.prototype, 'save').mockRejectedValueOnce(
        new Error('Simulated save failure')
      );

      // Attempt update that changes date (triggers transaction)
      const updateResult = await update({
        id: appointment.id,
        start: '2024-01-23T17:00:00.000Z', // Different date
        end: '2024-01-23T17:30:00.000Z',
        service: 'Haircut',
        employeeId: employee.id,
      });

      // Should return an error Result
      expect(updateResult.status).toBe('error');
      if (updateResult.status !== 'error') throw new Error('Expected Error result');
      expect(updateResult.error.message).toBe('Failed to update appointment');

      // Verify rollback: appointment should still have original scheduleId
      const unchangedAppt = await Appointment.findByPk(appointment.id);
      expect(unchangedAppt?.scheduleId).toBe(originalScheduleId);

      // Verify rollback: schedule1 should still have the appointment
      await schedule1.reload();
      const schedule1Appts = await schedule1.getAppointments();
      expect(schedule1Appts).toHaveLength(1);
      expect(schedule1Appts[0].id).toBe(appointment.id);

      // Verify rollback: schedule2 should NOT have the appointment
      await schedule2.reload();
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
        open: new Date('2024-01-22T14:00:00.000Z'),
        close: new Date('2024-01-22T22:00:00.000Z'),
      });

      const schedule2 = await Schedule.create({
        open: new Date('2024-01-23T14:00:00.000Z'),
        close: new Date('2024-01-23T22:00:00.000Z'),
      });

      const appointment = await Appointment.create({
        start: new Date('2024-01-22T17:00:00.000Z'),
        end: new Date('2024-01-22T17:30:00.000Z'),
        service: 'Haircut',
        status: 'scheduled',
        clientId: client.id,
        employeeId: employee.id,
        scheduleId: schedule1.id,
      });

      // Update to different date (should succeed)
      const updateResult = await update({
        id: appointment.id,
        start: '2024-01-23T17:00:00.000Z',
        end: '2024-01-23T17:30:00.000Z',
        service: 'Haircut',
        employeeId: employee.id,
      });

      expect(updateResult.status).toBe('ok');
      if (updateResult.status !== 'ok') throw new Error('Expected Ok result');
      const updated = updateResult.value;

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
