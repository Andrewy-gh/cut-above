const express = require('express');
const router = express.Router();
const appointmentRouter = require('../controllers/appointment');
const middleware = require('../utils/middleware');

router
  .route('/')
  .get(middleware.verifyJWT, appointmentRouter.getAllAppointments)
  .post(middleware.verifyJWT, appointmentRouter.bookAppointment);

router
  .route('/status/:id')
  .put(middleware.verifyJWT, appointmentRouter.updateAppointmentStatus);

router
  .route('/:id')
  .get(appointmentRouter.getOneAppointment)
  .put(
    middleware.verifyJWT,
    middleware.handleEmailTokenError,
    appointmentRouter.modifyAppointment
  )
  .delete(
    middleware.verifyJWT,
    middleware.handleEmailTokenError,
    appointmentRouter.cancelAppointment
  );

module.exports = router;
