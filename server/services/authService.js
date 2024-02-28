import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User, PasswordResetToken } from '../models/index.js';
import { generateResetLink } from '../utils/emailOptions.js';
import ApiError from '../utils/ApiError.js';

export const registerUser = async (credentials) => {
  const { firstName, lastName, email, password } = credentials;
  const passwordHash = await bcrypt.hash(password, 10);
  return await User.create({ firstName, lastName, email, passwordHash });
};

export const authenticateUser = async (credentials) => {
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

export const updateEmail = async (user) => {
  const currentUser = await User.findByPk(user.id);
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

export const updatePassword = async (user) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  await User.update({ passwordHash }, { where: { id: user.id } });
};

const storeToken = async (userId, token) => {
  const tokenHash = await bcrypt.hash(token, 10);
  return await PasswordResetToken.create({ userId, tokenHash });
};

const checkForExistingToken = async (userId) => {
  const existingToken = await PasswordResetToken.findOne({ where: { userId } });
  if (existingToken) {
    await existingToken.destroy();
  }
};

export const generateTokenLink = async (email) => {
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

export const validateToken = async (user) => {
  const resetToken = await PasswordResetToken.findOne({
    where: { userId: user.id },
  });
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

export const resetPassword = async (user, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  await user.save();
  await deleteResetTokenById(user.id);
};

const deleteResetTokenById = async (id) => {
  const token = await PasswordResetToken.findOne({ where: { userId: id } });
  await token.destroy();
};
