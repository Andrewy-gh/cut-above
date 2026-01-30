import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sequelize } from '../utils/db.js';
import { PasswordResetToken, User } from '../models/index.js';
import {
  authenticateUser,
  generateTokenLink,
  registerUser,
  resetPassword,
  updateEmail,
  updatePassword,
  validateToken,
} from './authService.js';
import { CLIENT_URL } from '../utils/config.js';

const createUser = async (overrides?: Partial<User>) => {
  const passwordHash = await bcrypt.hash('password123', 10);
  return User.create({
    firstName: 'Test',
    lastName: 'User',
    email: `user-${crypto.randomUUID()}@example.com`,
    passwordHash,
    role: 'client',
    ...overrides,
  });
};

describe('authService', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerUser hashes password and stores user', async () => {
    const result = await registerUser({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'super-secret',
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');

    const stored = await User.scope('withPassword').findByPk(result.value.id);
    expect(stored).toBeTruthy();
    expect(stored?.passwordHash).not.toBe('super-secret');
    expect(await bcrypt.compare('super-secret', stored?.passwordHash ?? '')).toBe(
      true,
    );
  });

  it('authenticateUser returns payload for valid credentials', async () => {
    const user = await createUser({ email: 'login@example.com' });

    const result = await authenticateUser({
      email: user.email,
      password: 'password123',
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');
    expect(result.value.email).toBe(user.email);
    expect(result.value.id).toBe(user.id);
    expect(result.value).not.toHaveProperty('passwordHash');
  });

  it('authenticateUser rejects invalid password', async () => {
    const user = await createUser({ email: 'wrong-pass@example.com' });

    const result = await authenticateUser({
      email: user.email,
      password: 'incorrect',
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') throw new Error('Expected Error result');
    expect(result.error.message).toBe('Unauthorized');
    expect(result.error.statusCode).toBe(401);
  });

  it('updateEmail returns not found for missing user', async () => {
    const result = await updateEmail({
      id: crypto.randomUUID(),
      email: 'missing@example.com',
    });

    expect(result.status).toBe('error');
    if (result.status !== 'error') throw new Error('Expected Error result');
    expect(result.error.message).toBe('User not found');
    expect(result.error.statusCode).toBe(404);
  });

  it('updateEmail updates the stored email', async () => {
    const user = await createUser({ email: 'old@example.com' });

    const result = await updateEmail({
      id: user.id,
      email: 'new@example.com',
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');

    const updated = await User.findByPk(user.id);
    expect(updated?.email).toBe('new@example.com');
  });

  it('updatePassword updates password hash', async () => {
    const user = await createUser({ email: 'pw@example.com' });

    const result = await updatePassword({
      id: user.id,
      password: 'new-password',
    });

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');

    const updated = await User.scope('withPassword').findByPk(user.id);
    expect(updated).toBeTruthy();
    expect(await bcrypt.compare('new-password', updated?.passwordHash ?? '')).toBe(
      true,
    );
  });

  it('generateTokenLink returns null when user does not exist', async () => {
    const result = await generateTokenLink('missing@example.com');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');
    expect(result.value).toBeNull();
  });

  it('generateTokenLink rotates existing token and stores new one', async () => {
    const user = await createUser({ email: 'reset@example.com' });
    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: await bcrypt.hash('old-token', 10),
    });

    const tokenBuffer = Buffer.from('test-token');
    vi.spyOn(crypto, 'randomBytes').mockReturnValue(tokenBuffer);
    const tokenHex = tokenBuffer.toString('hex');

    const result = await generateTokenLink(user.email);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');
    expect(result.value).toBe(`${CLIENT_URL}/${user.id}/${tokenHex}`);

    const tokens = await PasswordResetToken.findAll({ where: { userId: user.id } });
    expect(tokens).toHaveLength(1);
    expect(await bcrypt.compare(tokenHex, tokens[0].tokenHash)).toBe(true);
  });

  it('validateToken increments usage on success', async () => {
    const user = await createUser({ email: 'validate@example.com' });
    const token = 'valid-token';
    const tokenHash = await bcrypt.hash(token, 10);
    await PasswordResetToken.create({ userId: user.id, tokenHash });

    const result = await validateToken({ id: user.id, token });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');

    const updated = await PasswordResetToken.findOne({ where: { userId: user.id } });
    expect(updated?.timesUsed).toBe(1);
  });

  it('validateToken rejects expired tokens and deletes them', async () => {
    const user = await createUser({ email: 'expired@example.com' });
    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: await bcrypt.hash('expired-token', 10),
      expiresAt: new Date(Date.now() - 60_000),
    });

    const result = await validateToken({ id: user.id, token: 'expired-token' });
    expect(result.status).toBe('error');

    const remaining = await PasswordResetToken.findOne({ where: { userId: user.id } });
    expect(remaining).toBeNull();
  });

  it('resetPassword updates user password and clears reset token', async () => {
    const user = await createUser({ email: 'reset-pass@example.com' });
    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: await bcrypt.hash('reset-token', 10),
    });

    const result = await resetPassword(user, 'brand-new');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Expected Ok result');

    const updated = await User.scope('withPassword').findByPk(user.id);
    expect(await bcrypt.compare('brand-new', updated?.passwordHash ?? '')).toBe(
      true,
    );

    const remaining = await PasswordResetToken.findOne({ where: { userId: user.id } });
    expect(remaining).toBeNull();
  });
});
