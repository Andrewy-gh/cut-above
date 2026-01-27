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

vi.mock('../utils/redis.js', () => ({
  pub: {
    xadd: vi.fn(),
  },
  sub: {
    xread: vi.fn(),
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

  it('logs and throws on transport error', async () => {
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
    ).rejects.toThrow('SMTP down');

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

  it('requeues failed emails with incremented attempt', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('SMTP down'));
    (nodemailer as unknown as { createTransport: (opts: unknown) => unknown }).createTransport =
      vi.fn(() => ({ sendMail }));

    const redis = await import('../utils/redis.js');
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation((handler) => {
        if (typeof handler === 'function') {
          handler();
        }
        return 0 as unknown as NodeJS.Timeout;
      });

    const { listenForMessage } = await import('./emailService.js');

    const payload = {
      receiver: 'test@example.com',
      employee: 'John',
      date: '01/22/2024',
      time: '12:00pm',
      option: 'confirmation' as const,
      emailLink: 'http://localhost:3000/appointment/appt-123',
      attempt: 0,
    };

    (redis.sub.xread as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        ['email-stream', [['1-0', ['data', JSON.stringify(payload)]]]],
      ])
      .mockResolvedValueOnce(null);

    await listenForMessage('0');

    expect(redis.pub.xadd).toHaveBeenCalledWith(
      'email-stream',
      'MAXLEN',
      '100',
      '*',
      'data',
      JSON.stringify({ ...payload, attempt: 1 })
    );

    setTimeoutSpy.mockRestore();
  });
});
