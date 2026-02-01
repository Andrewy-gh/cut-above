import { Router, type Router as IRouter } from 'express';
import userRoutes from './userRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import schedulesRoutes from './scheduleRoutes.js';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import emailRoutes from './emailRoutes.js';
import docsRoutes from './docsRoutes.js';

const router: IRouter = Router();

router.use('/api/users', userRoutes);
router.use('/api/appointments', appointmentRoutes);
router.use('/api/schedules', schedulesRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/employees', employeeRoutes);
router.use('/api/email', emailRoutes);
router.use('/api/docs', docsRoutes);

export default router;
