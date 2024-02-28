import { Appointment, User } from '../models/index.js';
import {
  createNew,
  getAppointmentsByRole,
  update,
  getClientAppointmentById,
} from '../services/appointmentService.js';
import { publishMessage } from '../services/emailService.js';
import { formatAppt, formatEmail } from '../utils/formatters.js';

/**
 * @description retrieve all appointments
 * @route /api/appointments
 * @method GET
 */
export const getAllAppointments = async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  const appointments = await getAppointmentsByRole(user);
  res.json(appointments);
};

/**
 * @description retrieve all appointments
 * @route /api/appointments/:id
 * @method GET
 */
export const getSingleAppointment = async (req, res) => {
  const appointment = await getClientAppointmentById(req.params.id);
  res.json(appointment);
};

/**
 * @description book a new appointment
 * @route /api/appointments
 * @method POST
 */
export const bookAppointment = async (req, res) => {
  const appointment = formatAppt(req.body);
  const newAppointment = await createNew({
    ...appointment,
    clientId: req.session.user.id,
  });
  const newBookingEmail = formatEmail({
    ...req.body,
    id: newAppointment.id,
    option: 'confirmation',
  });
  await publishMessage({
    ...newBookingEmail,
    receiver: req.session.user.email,
  });
  res.status(200).json({
    success: true,
    message: 'Appointment successfully updated',
  });
};

/**
 * @description modify an appointment
 * @route /api/appointments/:id
 * @method PUT
 */
export const modifyAppointment = async (req, res) => {
  const appointment = formatAppt(req.body);
  const modifiedAppointment = await update({
    ...appointment,
    id: req.params.id,
  });
  const modifyEmail = formatEmail({
    ...req.body,
    id: modifiedAppointment.id,
    option: 'modification',
  });
  await publishMessage({
    ...modifyEmail,
    receiver: req.session.user.email,
  });
  res.status(200).json({
    success: true,
    message: 'Appointment successfully updated',
  });
};

/**
 * @description update an appointment status, admin route
 * @route /api/appointments/status/:id
 * @method PUT
 */
export const updateAppointmentStatus = async (req, res) => {
  await Appointment.update(
    { status: req.body.status },
    { where: { id: req.params.id } }
  );
  res
    .status(200)
    .json({ success: true, message: 'Appointment status updated' });
};

/**
 * @description delete an Appointment by id
 * @route /api/appointments/:id
 * @method DELETE
 */
export const deleteAppointmentById = async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [{ model: User, as: 'employee' }],
  });
  await appointment.destroy();
  const deleteEmail = formatEmail({
    date: appointment.date,
    time: appointment.start,
    employee: appointment.employee,
    option: 'cancellation',
  });
  await publishMessage({ ...deleteEmail, receiver: req.session.user.email });
  res
    .status(200)
    .json({ success: true, message: 'Appointment successfully cancelled' });
};
