import { Router, type Router as IRouter } from 'express';
import {
  getAllEmployees,
  getEmployeeProfiles,
} from '../controllers/employeeController.js';

const router: IRouter = Router();

router.route('/').get(getAllEmployees);

router.route('/profiles').get(getEmployeeProfiles);

export default router;
