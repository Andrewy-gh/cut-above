import { Router } from 'express';
import {
  handleNewMessage,
  sendPasswordReset,
} from '../controllers/emailController.js';
import {
  newMessageSchema,
  passwordResetSchema,
} from '../schemas/emailSchema.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router
  .route('/new-message')
  .post(validate({ body: newMessageSchema }), handleNewMessage);

router
  .route('/reset-pw')
  .post(validate({ body: passwordResetSchema }), sendPasswordReset);

export default router;
