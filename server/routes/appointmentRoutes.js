import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
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

const router = Router();

router
  .route('/')
  .get(authenticateUser, getAllAppointments)
  .post(
    celebrate(
      { [Segments.BODY]: bookingSchema }
      // https://github.com/arb/celebrate#celebrateschema-joioptions-opts
      // https://github.com/hapijs/joi/blob/master/API.md#anyvalidatevalue-options
      // https://joi.dev/api/?v=17.12.0#date
      //  If the validation convert option is on (enabled by default), a string or number will be converted to a Date if specified.
      // { convert: false }
    ),
    authenticateUser,
    bookAppointment
  );

router.route('/status/:id').put(
  celebrate(
    { [Segments.PARAMS]: idSchema, [Segments.BODY]: statusSchema },
    {
      abortEarly: false,
      warnings: true,
    },
    { mode: 'full' }
  ),
  authenticateUser,
  authenticateRole,
  updateAppointmentStatus
);

router
  .route('/:id')
  .get(
    celebrate({ [Segments.PARAMS]: idSchema }),
    authenticateUser,
    getSingleAppointment
  )
  .put(
    celebrate(
      { [Segments.PARAMS]: idSchema, [Segments.BODY]: bookingSchema },
      {
        abortEarly: false,
        warnings: true,
        // convert: false
      },
      // https://github.com/arb/celebrate#modes - validates the entire request object and collects all the validation failures in the result.
      { mode: 'full' }
    ),
    authenticateUser,
    modifyAppointment
  )
  .delete(
    celebrate({ [Segments.PARAMS]: idSchema }),
    authenticateUser,
    deleteAppointmentById
  );

export default router;
