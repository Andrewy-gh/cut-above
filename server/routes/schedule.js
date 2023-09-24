const express = require('express');
const router = express.Router();
const scheduleRouter = require('../controllers/schedule');
const middleware = require('../utils/middleware');

router
  .route('/')
  .get(scheduleRouter.getAllSchedules)
  .post(middleware.verifyJWT, scheduleRouter.createNewSchedule);

router
  .route('/:id')
  .put(middleware.verifyJWT, scheduleRouter.addAppointmentToSchedule);

module.exports = router;
