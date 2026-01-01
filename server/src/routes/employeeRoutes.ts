import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeProfiles,
} from '../controllers/employeeController.js';

const router = Router();

router.route('/').get(getAllEmployees);

router.route('/profiles').get(getEmployeeProfiles);

export default router;
