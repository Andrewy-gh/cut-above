const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const date = require('../utils/date');

const getAllSchedules = async (req, res) => {
  const schedule = await Schedule.find({}).populate(
    'appointments',
    'start end client employee service status'
  );
  res.json(schedule);
};

const createNewSchedule = async (req, res) => {
  const { dates, open, close } = req.body;
  const dateRangeToSchedule = date.generateRange(dates, open, close);
  const newSchedules = dateRangeToSchedule
    .map((schedule) => new Schedule(schedule))
    .map((newSchedule) => newSchedule.save());
  const savedSchedules = await Promise.all(newSchedules);
  res.status(201).json({
    success: true,
    message: 'New schedule added',
    data: savedSchedules,
  });
};

const addAppointmentToSchedule = async (req, res) => {
  const { appointment } = req.body;
  const bookedAppt = await Appointment.findOne({ _id: appointment });
  const schedule = await Schedule.findOne({ _id: req.params.id });
  schedule.appointments.push(bookedAppt);
  await schedule.save();

  res
    .status(200)
    .json({ success: true, message: 'Schedule updated', data: schedule });
};

module.exports = {
  getAllSchedules,
  createNewSchedule,
  addAppointmentToSchedule,
};
