import { Router } from 'express';
import {
  login,
  logout,
  register,
  handleTokenValidation,
  handlePasswordReset,
  changeEmail,
  changePassword,
} from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authenticateUser.js';
import validateToken from '../middlewares/validateToken.js';
import { validate } from '../middlewares/validate.js';
import {
  loginSchema,
  signupSchema,
  emailSchema,
  passwordSchema,
  tokenUrlSchema,
} from '../schemas/authSchema.js';

const router = Router();

router.route('/login').post(validate({ body: loginSchema }), login);

router.route('/logout').get(authenticateUser, logout);

router
  .route('/signup')
  .post(validate({ body: signupSchema }), register);

router
  .route('/email')
  .put(
    validate({ body: emailSchema }),
    authenticateUser,
    changeEmail
  );

router
  .route('/password')
  .put(
    validate({ body: passwordSchema }),
    authenticateUser,
    changePassword
  );

router
  .route('/validation/:id/:token')
  .get(validate({ params: tokenUrlSchema }), handleTokenValidation);

router.route('/reset-pw/:id/:token').put(
  validate({
    params: tokenUrlSchema,
    body: passwordSchema,
  }),
  validateToken,
  handlePasswordReset
);

export default router;
