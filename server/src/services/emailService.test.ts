import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nodemailer from 'nodemailer';

const envBackup = { ...process.env };

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

vi.mock('../utils/logger/index.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/redis.js', () => ({
  pub: {
    xadd: vi.fn(),
  },
  sub: {
    xread: vi.fn(),
  },
}));

describe('emailService', () => {
  beforeEach(() => {
    process.env = {
      ...envBackup,
      NODE_ENV: 'production',
      EMAIL_SERVICE: 'smtp',
      EMAIL_USER: 'sender@example.com',
      EMAIL_PASSWORD: 'password',
      PROD_CLIENT_URL: 'http://localhost:3000',
    };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('sends email with expected payload', async () => {
    const sendMail = vi.fn().mockResolvedValue({
      accepted: ['test@example.com'],
      rejected: [],
      response: 'OK',
    });

    (nodemailer as unknown as { createTransport: (opts: unknown) => unknown }).createTransport =
      vi.fn(() => ({ sendMail }));

    const { sendEmail } = await import('./emailService.js');

    await sendEmail({
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
  });

  it('logs and does not throw on transport error', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('SMTP down'));
    (nodemailer as unknown as { createTransport: (opts: unknown) => unknown }).createTransport =
      vi.fn(() => ({ sendMail }));

    const logger = (await import('../utils/logger/index.js')).default;
    const { sendEmail } = await import('./emailService.js');

    await expect(
      sendEmail({
        receiver: 'test@example.com',
        employee: 'John',
        date: '01/22/2024',
        time: '12:00pm',
        option: 'confirmation',
        emailLink: 'http://localhost:3000/appointment/appt-123',
      })
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalled();
  });

  it('publishes formatted payload to redis stream', async () => {
    const redis = await import('../utils/redis.js');
    const { publishMessage } = await import('./emailService.js');

    const payload = {
      receiver: 'test@example.com',
      employee: 'John',
      date: '01/22/2024',
      time: '12:00pm',
      option: 'confirmation' as const,
      emailLink: 'http://localhost:3000/appointment/appt-123',
    };

    await publishMessage(payload);

    expect(redis.pub.xadd).toHaveBeenCalledWith(
      'email-stream',
      'MAXLEN',
      '100',
      '*',
      'data',
      JSON.stringify(payload)
    );
  });
});
