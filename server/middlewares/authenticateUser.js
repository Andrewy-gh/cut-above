import ApiError from '../utils/ApiError.js';

export const authenticateUser = async (req, res, next) => {
  if (!req.session) {
    throw new ApiError(403, 'Forbidden: not authenticated');
  }
  if (!req.session.user) {
    throw new ApiError(401, 'Session expired, please log in');
  }
  next();
};

export const authenticateRole = async (req, res, next) => {
  if (req.session.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden: not authorized to access this page');
  }
  next();
};
