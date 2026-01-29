import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
const findOrCreateMock = vi.fn();

vi.mock('../models/EmailOutbox.js', () => ({
  default: {
    create: createMock,
    findOrCreate: findOrCreateMock,
  },
}));

describe('emailOutboxService', () => {
  beforeEach(() => {
    createMock.mockReset();
    findOrCreateMock.mockReset();
  });

  it('enqueues a generic email outbox item', async () => {
    const { enqueueEmail } = await import('./emailOutboxService.js');

    findOrCreateMock.mockResolvedValue([{}, true]);

    const result = await enqueueEmail({
      payload: {
        receiver: 'test@example.com',
        option: 'reset password',
      },
      eventType: 'auth.reset_password',
      dedupeKey: 'auth.reset_password:test',
    });

    expect(result.status).toBe('ok');
    expect(findOrCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dedupeKey: 'auth.reset_password:test' },
        defaults: expect.objectContaining({
          eventType: 'auth.reset_password',
          dedupeKey: 'auth.reset_password:test',
          status: 'pending',
          payload: expect.objectContaining({
            receiver: 'test@example.com',
          }),
        }),
        transaction: undefined,
      }),
    );
  });

  it('enqueues appointment emails with a deterministic dedupe key', async () => {
    const { enqueueAppointmentEmail } = await import('./emailOutboxService.js');

    findOrCreateMock.mockResolvedValue([{}, true]);

    const result = await enqueueAppointmentEmail({
      appointmentId: 'appt-1',
      start: '2024-01-22T17:00:00.000Z',
      end: '2024-01-22T17:30:00.000Z',
      service: 'Haircut',
      employeeId: 'emp-1',
      employeeFirstName: 'John',
      receiver: 'client@example.com',
      option: 'confirmation',
    });

    expect(result.status).toBe('ok');
    expect(findOrCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          dedupeKey:
            'appointment|appt-1|appointment.confirmation|2024-01-22T17:00:00.000Z|2024-01-22T17:30:00.000Z|Haircut|emp-1|client@example.com',
        },
        defaults: expect.objectContaining({
          eventType: 'appointment.confirmation',
          dedupeKey:
            'appointment|appt-1|appointment.confirmation|2024-01-22T17:00:00.000Z|2024-01-22T17:30:00.000Z|Haircut|emp-1|client@example.com',
          payload: expect.objectContaining({
            receiver: 'client@example.com',
            option: 'confirmation',
          }),
        }),
        transaction: undefined,
      }),
    );
  });
});
