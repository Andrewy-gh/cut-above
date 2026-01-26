import { Request, Response } from 'express';
import { Appointment, User } from '../models/index.js';
import {
  createNew,
  getAppointmentsByRole,
  update,
  getClientAppointmentById,
} from '../services/appointmentService.js';
import { publishMessage } from '../services/emailService.js';
import { formatEmail } from '../utils/formatters.js';
import ApiError from '../utils/ApiError.js';
import type { UserRole } from '../types/index.js';

async function getUserFromSession(req: Request) {
  if (!req.session.userId) throw new ApiError(401, 'Session expired');
  const user = await User.findByPk(req.session.userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

const assertRoleAllowed = (user: User, roles: UserRole[]) => {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'Forbidden: role not allowed');
  }
};

const assertAppointmentAccess = (
  user: User,
  appointment: Appointment,
  options: { allowAdmin?: boolean } = {}
) => {
  if (options.allowAdmin && user.role === 'admin') return;

  const isClientOwner = user.role === 'client' && appointment.clientId === user.id;
  const isEmployeeOwner = user.role === 'employee' && appointment.employeeId === user.id;
  if (isClientOwner || isEmployeeOwner) return;

  throw new ApiError(403, 'Forbidden: not authorized to access this appointment');
};

const assertValidEmployeeSelection = async (
  employeeId: string,
  clientId: string
) => {
  if (employeeId === clientId) {
    throw new ApiError(400, 'Client and employee must be different');
  }
  const employee = await User.findByPk(employeeId);
  if (!employee || employee.role !== 'employee') {
    throw new ApiError(400, 'Invalid employee');
  }
};

/**
 * @description retrieve all appointments
 * @route /api/appointments
 * @method GET
 */
export const getAllAppointments = async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  assertRoleAllowed(user, ['client', 'employee']);
  const appointments = await getAppointmentsByRole(user);
  res.json(appointments);
};

/**
 * @description retrieve all appointments
 * @route /api/appointments/:id
 * @method GET
 */
export const getSingleAppointment = async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  assertRoleAllowed(user, ['client', 'employee']);

  const appointment = await getClientAppointmentById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  assertAppointmentAccess(user, appointment);
  res.json(appointment);
};

/**
 * @description book a new appointment
 * @route /api/appointments
 * @method POST
 */
export const bookAppointment = async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  assertRoleAllowed(user, ['client']);
  await assertValidEmployeeSelection(req.body.employee.id, user.id);

  const newAppointment = await createNew({
    start: req.body.start,
    end: req.body.end,
    service: req.body.service,
    employeeId: req.body.employee.id,
    clientId: req.session.userId!,
  });

  await publishMessage({
    ...formatEmail({ ...req.body, id: newAppointment.id, option: 'confirmation' }),
    receiver: user.email,
  });

  res.status(200).json({ success: true, message: 'Appointment successfully created' });
};

/**
 * @description modify an appointment
 * @route /api/appointments/:id
 * @method PUT
 */
export const modifyAppointment = async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  assertRoleAllowed(user, ['client', 'employee', 'admin']);

  const appointment = await Appointment.findByPk(req.params.id, {
    include: [{ model: User, as: 'client' }],
  }) as (Appointment & { client?: User }) | null;
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  assertAppointmentAccess(user, appointment, { allowAdmin: true });

  const requestedEmployeeId = req.body.employee?.id;
  if (user.role === 'employee') {
    if (requestedEmployeeId && requestedEmployeeId !== appointment.employeeId) {
      throw new ApiError(403, 'Forbidden: cannot change employee');
    }
  } else if (requestedEmployeeId) {
    const clientId = appointment.clientId;
    await assertValidEmployeeSelection(requestedEmployeeId, clientId);
  }

  const modifiedAppointment = await update({
    id: req.params.id,
    start: req.body.start,
    end: req.body.end,
    service: req.body.service,
    employeeId: req.body.employee?.id,
    status: req.body.status,
  });

  const receiverEmail = appointment.client?.email ?? user.email;

  await publishMessage({
    ...formatEmail({ ...req.body, id: modifiedAppointment.id, option: 'modification' }),
    receiver: receiverEmail,
  });

  res.status(200).json({ success: true, message: 'Appointment successfully updated' });
};

/**
 * @description update an appointment status, admin route
 * @route /api/appointments/status/:id
 * @method PUT
 */
export const updateAppointmentStatus = async (req: Request, res: Response) => {
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
export const deleteAppointmentById = async (req: Request, res: Response) => {
  const user = await getUserFromSession(req);
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { model: User, as: 'employee' },
      { model: User, as: 'client' },
    ],
  }) as (Appointment & { employee: User; client: User }) | null;

  if (!appointment) throw new ApiError(404, 'Appointment not found');
  assertAppointmentAccess(user, appointment, { allowAdmin: true });

  await appointment.destroy();

  const receiverEmail = appointment.client?.email ?? user.email;

  await publishMessage({
    ...formatEmail({
      id: appointment.id,
      start: appointment.start.toISOString(),
      end: appointment.end.toISOString(),
      service: appointment.service,
      employee: appointment.employee,
      option: 'cancellation',
    }),
    receiver: receiverEmail,
  });

  res.status(200).json({ success: true, message: 'Appointment successfully cancelled' });
};
