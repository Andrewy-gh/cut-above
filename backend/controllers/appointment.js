const appointmentRouter = require('express').Router();
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

appointmentRouter.get('/', async (request, response) => {
  const appointments = await Appointment.find({
    $or: [{ client: request.user }, { employee: request.user }],
  });
  response.status(200).json(appointments);
});

// TODO: date has time
appointmentRouter.post('/', async (request, response) => {
  const { date, start, end, service, employee } = request.body;
  const clientToBook = await User.findOne({ _id: request.user });
  const employeeToBook = await User.findOne({ _id: employee });
  const newAppt = new Appointment({
    date,
    start,
    end,
    service,
    client: clientToBook,
    employee: employeeToBook,
  });
  await newAppt.save();
  response.status(201).json({
    success: true,
    message: 'Appointment successfully reserved',
    data: newAppt,
  });
});

appointmentRouter.put('/:id', async (request, response) => {
  console.log(request.params.id, request.body);
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true, context: 'query' }
  );
  response.status(200).json({
    success: true,
    message: 'Appointment successfully reserved',
    data: updatedAppointment,
  });
});

appointmentRouter.delete('/:id', async (request, response) => {
  console.log('req.body', request.body);
  const { employee, time } = await Appointment.findByIdAndDelete(
    request.params.id
  );
  console.log('employee: ', employee);
  console.log('time: ', time);
  const scheduleToUpdate = await Schedule.findOne({ time: time });
  const index = scheduleToUpdate.appointments.findIndex(
    (appt) => appt._id.toString() === request.params.id
  );
  scheduleToUpdate.appointments.splice(index, 1);
  scheduleToUpdate.available.push(employee);
  await scheduleToUpdate.save();

  response.status(200).json({
    success: true,
    message: 'Appointment successfully cancelled',
  });
});

module.exports = appointmentRouter;
