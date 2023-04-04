const appointmentRouter = require('express').Router();
const Appointment = require('../models/Appointment');

appointmentRouter.get('/', async (request, response) => {
  const appointments = await Appointment.find({
    $or: [{ client: request.user }, { employee: request.user }],
  }).populate('client employee', 'id email firstName image');
  response.status(200).json(appointments);
});

module.exports = appointmentRouter;
