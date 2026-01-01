import { Router } from 'express';
import { getAllUsers } from '../controllers/userController.js';
import {
  authenticateUser,
  authenticateRole,
} from '../middlewares/authenticateUser.js';

const router = Router();

// ! TODO
router.route('/').get(authenticateUser, authenticateRole, getAllUsers);

export default router;
