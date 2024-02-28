import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
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
import {
  loginSchema,
  signupSchema,
  emailSchema,
  passwordSchema,
  tokenUrlSchema,
} from '../schemas/authSchema.js';

const router = Router();

router.route('/login').post(celebrate({ [Segments.BODY]: loginSchema }), login);

router.route('/logout').get(authenticateUser, logout);

router
  .route('/signup')
  .post(celebrate({ [Segments.BODY]: signupSchema }), register);

router
  .route('/email')
  .put(
    celebrate({ [Segments.BODY]: emailSchema }),
    authenticateUser,
    changeEmail
  );

router
  .route('/password')
  .put(
    celebrate({ [Segments.BODY]: passwordSchema }),
    authenticateUser,
    changePassword
  );

router
  .route('/validation/:id/:token')
  .get(celebrate({ [Segments.PARAMS]: tokenUrlSchema }), handleTokenValidation);

router.route('/reset-pw/:id/:token').put(
  celebrate(
    {
      [Segments.PARAMS]: tokenUrlSchema,
      [Segments.BODY]: passwordSchema,
    },
    {
      abortEarly: false,
      warnings: true,
    },
    { mode: 'full' }
  ),
  validateToken,
  handlePasswordReset
);

export default router;
