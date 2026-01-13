import { Router, type Router as IRouter } from 'express';
import {
  getAllSchedulesPublic,
  getAllSchedulesPrivate,
  createNewSchedule,
} from '../controllers/scheduleController.js';
import {
  authenticateUser,
  authenticateRole,
} from '../middlewares/authenticateUser.js';

const router: IRouter = Router();

router
  .route('/')
  .get(getAllSchedulesPublic)
  .post(authenticateUser, authenticateRole, createNewSchedule);

router
  .route('/dashboard')
  .get(authenticateUser, authenticateRole, getAllSchedulesPrivate);

export default router;
