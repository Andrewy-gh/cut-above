const scheduleRouter = require('express').Router();
const Schedule = require('../models/Schedule');
const User = require('../models/User');

scheduleRouter.get('/', async (request, response) => {
  const schedule = await Schedule.find({}).populate(
    'available',
    'id email firstName image'
  );
  response.json(schedule);
});

scheduleRouter.post('/', async (request, response) => {
  const apptForDate = request.body;
  const employees = await User.find({ role: 'admin' });
  const apptToAdd = apptForDate.map(
    (appt) =>
      new Schedule({
        ...appt,
        available: employees,
      })
  );
  const apptToSave = apptToAdd.map((appt) => appt.save());
  const savedAppts = await Promise.all(apptToSave);
  response
    .status(201)
    .json({ message: 'New schedule added', data: savedAppts });
});

module.exports = scheduleRouter;
