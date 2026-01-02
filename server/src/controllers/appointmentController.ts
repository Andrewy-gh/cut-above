import { Request, Response } from 'express';
import { Appointment, User } from '../models/index.js';
import {
  createNew,
  getAppointmentsByRole,
  update,
  getClientAppointmentById,
} from '../services/appointmentService.js';
import { publishMessage } from '../services/emailService.js';
import { formatAppt, formatEmail } from '../utils/formatters.js';
import ApiError from '../utils/ApiError.js';

async function getUserFromSession(req: Request): Promise<User> {
  if (!req.session.userId) throw new ApiError(401, 'Session expired');
  const user = await User.findByPk(req.session.userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * @description retrieve all appointments
 * @route /api/appointments
 * @method GET
 */
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserFromSession(req);
  const appointments = await getAppointmentsByRole(user);
  res.json(appointments);
};

/**
 * @description retrieve all appointments
 * @route /api/appointments/:id
 * @method GET
 */
export const getSingleAppointment = async (req: Request, res: Response): Promise<void> => {
  const appointment = await getClientAppointmentById(req.params.id);
  res.json(appointment);
};

/**
 * @description book a new appointment
 * @route /api/appointments
 * @method POST
 */
export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserFromSession(req);
  const appointment = formatAppt(req.body);
  const newAppointment = await createNew({
    ...appointment,
    clientId: req.session.userId!,
  });
  const newBookingEmail = formatEmail({
    ...req.body,
    id: newAppointment.id,
    option: 'confirmation',
  });
  await publishMessage({
    ...newBookingEmail,
    receiver: user.email,
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
export const modifyAppointment = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserFromSession(req);
  const appointment = formatAppt(req.body);
  const modifiedAppointment = await update({
    date: appointment.date,
    start: appointment.start,
    end: appointment.end,
    service: appointment.service,
    employeeId: appointment.employeeId,
    id: req.params.id,
  });
  const modifyEmail = formatEmail({
    ...req.body,
    id: modifiedAppointment.id,
    option: 'modification',
  });
  await publishMessage({
    ...modifyEmail,
    receiver: user.email,
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
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
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
export const deleteAppointmentById = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserFromSession(req);
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [{ model: User, as: 'employee' }],
  }) as (Appointment & { employee: User }) | null;
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  await appointment.destroy();
  const deleteEmail = formatEmail({
    id: appointment.id,
    date: appointment.date.toISOString(),
    start: appointment.start.toISOString(),
    end: appointment.end.toISOString(),
    service: appointment.service,
    employee: appointment.employee,
    option: 'cancellation',
  });
  await publishMessage({ ...deleteEmail, receiver: user.email });
  res
    .status(200)
    .json({ success: true, message: 'Appointment successfully cancelled' });
};
