import { Router, type Router as IRouter } from 'express';
import { getAllUsers } from '../controllers/userController.js';
import {
  authenticateUser,
  authenticateRole,
} from '../middlewares/authenticateUser.js';

const router: IRouter = Router();

// ! TODO
router.route('/').get(authenticateUser, authenticateRole, getAllUsers);

export default router;
