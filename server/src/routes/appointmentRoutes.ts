import { Router, type Router as IRouter } from 'express';
import {
  getAllAppointments,
  getSingleAppointment,
  bookAppointment,
  modifyAppointment,
  updateAppointmentStatus,
  deleteAppointmentById,
} from '../controllers/appointmentController.js';
import {
  bookingSchema,
  idSchema,
  statusSchema,
} from '../schemas/appointmentSchema.js';
import {
  authenticateUser,
  authenticateRole,
} from '../middlewares/authenticateUser.js';
import { validate } from '../middlewares/validate.js';

const router: IRouter = Router();

router
  .route('/')
  .get(authenticateUser, getAllAppointments)
  .post(
    validate({ body: bookingSchema }),
    authenticateUser,
    bookAppointment
  );

router.route('/status/:id').put(
  validate({ params: idSchema, body: statusSchema }),
  authenticateUser,
  authenticateRole,
  updateAppointmentStatus
);

router
  .route('/:id')
  .get(
    validate({ params: idSchema }),
    authenticateUser,
    getSingleAppointment
  )
  .put(
    validate({ params: idSchema, body: bookingSchema }),
    authenticateUser,
    modifyAppointment
  )
  .delete(
    validate({ params: idSchema }),
    authenticateUser,
    deleteAppointmentById
  );

export default router;
