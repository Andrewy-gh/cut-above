import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  handleNewMessage,
  sendPasswordReset,
} from '../controllers/emailController.js';
import {
  newMessageSchema,
  passwordResetSchema,
} from '../schemas/emailSchema.js';

const router = Router();

router
  .route('/new-message')
  .post(celebrate({ [Segments.BODY]: newMessageSchema }), handleNewMessage);

router
  .route('/reset-pw')
  .post(celebrate({ [Segments.BODY]: passwordResetSchema }), sendPasswordReset);

export default router;
