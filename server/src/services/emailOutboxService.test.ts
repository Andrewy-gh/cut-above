import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();

vi.mock('../models/EmailOutbox.js', () => ({
  default: {
    create: createMock,
  },
}));

describe('emailOutboxService', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('enqueues a generic email outbox item', async () => {
    const { enqueueEmail } = await import('./emailOutboxService.js');

    await enqueueEmail({
      payload: {
        receiver: 'test@example.com',
        option: 'reset password',
      },
      eventType: 'auth.reset_password',
      dedupeKey: 'auth.reset_password:test',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.reset_password',
        dedupeKey: 'auth.reset_password:test',
        status: 'pending',
        payload: expect.objectContaining({
          receiver: 'test@example.com',
        }),
      }),
      expect.objectContaining({ transaction: undefined })
    );
  });

  it('enqueues appointment emails with a deterministic dedupe key', async () => {
    const { enqueueAppointmentEmail } = await import('./emailOutboxService.js');

    await enqueueAppointmentEmail({
      appointmentId: 'appt-1',
      start: '2024-01-22T17:00:00.000Z',
      end: '2024-01-22T17:30:00.000Z',
      service: 'Haircut',
      employeeId: 'emp-1',
      employeeFirstName: 'John',
      receiver: 'client@example.com',
      option: 'confirmation',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'appointment.confirmation',
        dedupeKey: expect.stringMatching(/^appointment:appt-1:/),
        payload: expect.objectContaining({
          receiver: 'client@example.com',
          option: 'confirmation',
        }),
      }),
      expect.objectContaining({ transaction: undefined })
    );
  });
});
