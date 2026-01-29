import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Result } from 'better-result';
import { User, PasswordResetToken } from '../models/index.js';
import { generateResetLink } from '../utils/emailOptions.js';
import type { UserRole } from '../types/index.js';
import {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
} from '../errors.js';

// Input types
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateEmailData {
  id: string;
  email: string;
}

export interface UpdatePasswordData {
  id: string;
  password: string;
}

export interface ValidateTokenData {
  id: string;
  token: string;
}

// Output types
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  image: string | null;
  profile: string | null;
}

export const registerUser = async (credentials: RegisterCredentials) =>
  Result.tryPromise({
    try: async () => {
      const { firstName, lastName, email, password, role = 'client' } =
        credentials;
      const passwordHash = await bcrypt.hash(password, 10);
      return User.create({ firstName, lastName, email, passwordHash, role });
    },
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message: cause instanceof Error ? cause.message : 'Failed to register',
      }),
  });

export const authenticateUser = async (credentials: LoginCredentials) =>
  Result.gen(async function* () {
    const user = yield* Result.await(
      Result.tryPromise({
        try: () =>
          User.scope('withPassword').findOne({
            where: { email: credentials.email },
          }),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to authenticate',
          }),
      }),
    );

    if (!user) {
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }

    const match = yield* Result.await(
      Result.tryPromise({
        try: () => bcrypt.compare(credentials.password, user.passwordHash),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to authenticate',
          }),
      }),
    );

    if (!match) {
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }

    const payload: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      image: user.image,
      profile: user.profile,
    };
    return Result.ok(payload);
  });

export const updateEmail = async (user: UpdateEmailData) =>
  Result.gen(async function* () {
    const currentUser = yield* Result.await(
      Result.tryPromise({
        try: () => User.findByPk(user.id),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to update email',
          }),
      }),
    );
    if (!currentUser) {
      return Result.err(
        new NotFoundError({ statusCode: 404, message: 'User not found' }),
      );
    }
    currentUser.email = user.email;
    yield* Result.await(
      Result.tryPromise({
        try: () => currentUser.save(),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to update email',
          }),
      }),
    );
    const payload: UserResponse = {
      id: currentUser.id,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      role: currentUser.role,
      image: currentUser.image,
      profile: currentUser.profile,
    };
    return Result.ok(payload);
  });

export const updatePassword = async (user: UpdatePasswordData) =>
  Result.gen(async function* () {
    const passwordHash = yield* Result.await(
      Result.tryPromise({
        try: () => bcrypt.hash(user.password, 10),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to update password',
          }),
      }),
    );
    yield* Result.await(
      Result.tryPromise({
        try: () => User.update({ passwordHash }, { where: { id: user.id } }),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to update password',
          }),
      }),
    );
    return Result.ok();
  });

const storeToken = async (userId: string, token: string) =>
  Result.tryPromise({
    try: async () => {
      const tokenHash = await bcrypt.hash(token, 10);
      return PasswordResetToken.create({ userId, tokenHash });
    },
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error ? cause.message : 'Failed to store token',
      }),
  });

const checkForExistingToken = async (userId: string) =>
  Result.tryPromise({
    try: async () => {
      const existingToken = await PasswordResetToken.findOne({
        where: { userId },
      });
      if (existingToken) {
        await existingToken.destroy();
      }
    },
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to rotate token',
      }),
  });

export const generateTokenLink = async (email: string) =>
  Result.gen(async function* () {
    const user = yield* Result.await(
      Result.tryPromise({
        try: () => User.findOne({ where: { email } }),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to generate reset link',
          }),
      }),
    );
    if (!user) {
      return Result.ok(null);
    }
    yield* Result.await(checkForExistingToken(user.id));
    const token = crypto.randomBytes(32).toString('hex'); // Generate random token
    yield* Result.await(storeToken(user.id, token));
    const resetUrl = generateResetLink(user.id, token);
    return Result.ok(resetUrl);
  });

export const validateToken = async (user: ValidateTokenData) =>
  Result.gen(async function* () {
    const resetToken = yield* Result.await(
      Result.tryPromise({
        try: () =>
          PasswordResetToken.findOne({ where: { userId: user.id } }),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to validate token',
          }),
      }),
    );
    if (!resetToken) {
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }
    if (new Date() > new Date(resetToken.expiresAt)) {
      yield* Result.await(deleteResetTokenById(user.id));
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }
    if (resetToken.timesUsed > 1) {
      // only two attempts allowed: initial validation and password reset
      yield* Result.await(deleteResetTokenById(user.id));
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }
    const isValid = yield* Result.await(
      Result.tryPromise({
        try: () => bcrypt.compare(user.token, resetToken.tokenHash),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to validate token',
          }),
      }),
    );
    if (!isValid) {
      yield* Result.await(deleteResetTokenById(user.id));
      return Result.err(
        new AuthorizationError({ statusCode: 401, message: 'Unauthorized' }),
      );
    }
    resetToken.timesUsed++;
    yield* Result.await(
      Result.tryPromise({
        try: () => resetToken.save(),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to validate token',
          }),
      }),
    );
    return Result.ok(resetToken);
  });

export const resetPassword = async (user: User, password: string) =>
  Result.gen(async function* () {
    const passwordHash = yield* Result.await(
      Result.tryPromise({
        try: () => bcrypt.hash(password, 10),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to reset password',
          }),
      }),
    );
    user.passwordHash = passwordHash;
    yield* Result.await(
      Result.tryPromise({
        try: () => user.save(),
        catch: (cause) =>
          new DatabaseError({
            statusCode: 500,
            message:
              cause instanceof Error
                ? cause.message
                : 'Failed to reset password',
          }),
      }),
    );
    yield* Result.await(deleteResetTokenById(user.id));
    return Result.ok();
  });

const deleteResetTokenById = async (id: string) =>
  Result.tryPromise({
    try: async () => {
      const token = await PasswordResetToken.findOne({ where: { userId: id } });
      if (token) {
        await token.destroy();
      }
    },
    catch: (cause) =>
      new DatabaseError({
        statusCode: 500,
        message:
          cause instanceof Error
            ? cause.message
            : 'Failed to clear reset token',
      }),
  });
