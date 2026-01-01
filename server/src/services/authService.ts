import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User, PasswordResetToken } from '../models/index.js';
import { generateResetLink } from '../utils/emailOptions.js';
import ApiError from '../utils/ApiError.js';
import type { UserRole } from '../types/index.js';

// Input types
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
}

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  const { firstName, lastName, email, password } = credentials;
  const passwordHash = await bcrypt.hash(password, 10);
  return await User.create({ firstName, lastName, email, passwordHash });
};

export const authenticateUser = async (credentials: LoginCredentials): Promise<UserResponse> => {
  const user = await User.scope('withPassword').findOne({
    where: { email: credentials.email },
  });
  if (!user) {
    throw new ApiError(401, 'Unauthorized');
  }
  const match = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Unauthorized');
  }
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
};

export const updateEmail = async (user: UpdateEmailData): Promise<UserResponse> => {
  const currentUser = await User.findByPk(user.id);
  if (!currentUser) {
    throw new ApiError(404, 'User not found');
  }
  currentUser.email = user.email;
  await currentUser.save();
  return {
    id: currentUser.id,
    email: currentUser.email,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    role: currentUser.role,
  };
};

export const updatePassword = async (user: UpdatePasswordData): Promise<void> => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  await User.update({ passwordHash }, { where: { id: user.id } });
};

const storeToken = async (userId: string, token: string): Promise<PasswordResetToken> => {
  const tokenHash = await bcrypt.hash(token, 10);
  return await PasswordResetToken.create({ userId, tokenHash });
};

const checkForExistingToken = async (userId: string): Promise<void> => {
  const existingToken = await PasswordResetToken.findOne({ where: { userId } });
  if (existingToken) {
    await existingToken.destroy();
  }
};

export const generateTokenLink = async (email: string): Promise<string | undefined> => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return;
  }
  await checkForExistingToken(user.id);
  const token = crypto.randomBytes(32).toString('hex'); // Generate random token
  await storeToken(user.id, token);
  const resetUrl = generateResetLink(user.id, token);
  return resetUrl;
};

export const validateToken = async (user: ValidateTokenData): Promise<PasswordResetToken> => {
  const resetToken = await PasswordResetToken.findOne({
    where: { userId: user.id },
  });
  if (!resetToken) {
    throw new ApiError(401, 'Unauthorized');
  }
  if (new Date().toISOString() > resetToken.expiresAt) {
    await resetToken.destroy();
    throw new ApiError(401, 'Unauthorized');
  }
  if (resetToken.timesUsed > 1) {
    // only two attempts allowed: initial validation and password reset
    await resetToken.destroy();
    throw new ApiError(401, 'Unauthorized');
  }
  const isValid = await bcrypt.compare(user.token, resetToken.tokenHash);
  if (!isValid) {
    await resetToken.destroy();
    throw new ApiError(401, 'Unauthorized');
  }
  resetToken.timesUsed++;
  await resetToken.save();
  return resetToken;
};

export const resetPassword = async (user: User, password: string): Promise<void> => {
  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  await user.save();
  await deleteResetTokenById(user.id);
};

const deleteResetTokenById = async (id: string): Promise<void> => {
  const token = await PasswordResetToken.findOne({ where: { userId: id } });
  if (token) {
    await token.destroy();
  }
};
