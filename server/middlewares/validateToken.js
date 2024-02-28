import { validateToken } from '../services/authService.js';

const tokenValidationMiddlware = async (req, res, next) => {
  await validateToken(req.params);
  next();
};

export default tokenValidationMiddlware;
