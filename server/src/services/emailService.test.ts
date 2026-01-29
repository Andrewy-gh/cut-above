import { describe, it, expect, vi } from 'vitest';
import nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

vi.mock('../utils/logger/index.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('emailService', () => {
  it('sends email with expected payload', async () => {
    // nodemailer is mocked; no real SMTP credentials needed.
    const sendMail = vi.fn().mockResolvedValue({
      accepted: ['test@example.com'],
      rejected: [],
      response: 'OK',
    });

    (nodemailer as unknown as { createTransport: (opts: unknown) => unknown }).createTransport =
      vi.fn(() => ({ sendMail }));

    const { sendEmail } = await import('./emailService.js');

    const result = await sendEmail({
      receiver: 'test@example.com',
      employee: 'John',
      date: '01/22/2024',
      time: '12:00pm',
      option: 'confirmation',
      emailLink: 'http://localhost:3000/appointment/appt-123',
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        to: 'test@example.com',
        subject: expect.stringContaining('Cut Above'),
        text: expect.stringContaining('01/22/2024'),
      })
    );
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');
    expect(result.value).toEqual(
      expect.objectContaining({
        accepted: ['test@example.com'],
      }),
    );
  });

  it('logs and throws on transport error', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('SMTP down'));
    (nodemailer as unknown as { createTransport: (opts: unknown) => unknown }).createTransport =
      vi.fn(() => ({ sendMail }));

    const logger = (await import('../utils/logger/index.js')).default;
    const { sendEmail } = await import('./emailService.js');

    const result = await sendEmail({
      receiver: 'test@example.com',
      employee: 'John',
      date: '01/22/2024',
      time: '12:00pm',
      option: 'confirmation',
      emailLink: 'http://localhost:3000/appointment/appt-123',
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') throw new Error('Expected Error result');
    expect(result.error.message).toBe('SMTP down');

    expect(logger.error).toHaveBeenCalled();
  });

});
