import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const envBackup = { ...process.env };

describe('emailOptions', () => {
  beforeEach(() => {
    process.env = {
      ...envBackup,
      NODE_ENV: 'production',
      PROD_CLIENT_URL: 'http://localhost:3000',
      EMAIL_USER: 'sender@example.com',
    };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('returns confirmation template with date and time', async () => {
    const { options } = await import('./emailOptions.js');

    const result = options(
      'John',
      '01/22/2024',
      '12:00pm',
      'confirmation',
      'http://localhost:3000/appointment/appt-123'
    );

    expect(result.subject).toContain('Cut Above');
    expect(result.text).toContain('01/22/2024');
    expect(result.text).toContain('12:00pm');
    expect(result.text).toContain('John');
  });

  it('returns reset password success template referencing EMAIL_USER', async () => {
    const { options } = await import('./emailOptions.js');

    const result = options(
      '',
      '',
      '',
      'reset password success',
      'http://localhost:3000/reset'
    );

    expect(result.subject).toContain('Password successfully changed');
    expect(result.text).toContain('sender@example.com');
  });

  it('throws on invalid option', async () => {
    const { options } = await import('./emailOptions.js');

    expect(() =>
      (options as unknown as (...args: unknown[]) => unknown)(
        '',
        '',
        '',
        'invalid-option',
        ''
      )
    ).toThrow('Invalid template option type');
  });
});
