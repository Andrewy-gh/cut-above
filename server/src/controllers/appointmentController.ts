import { Request, Response } from "express";
import { Appointment, User } from "../models/index.js";
import {
  createNew,
  getAppointmentsByRole,
  update,
  getClientAppointmentById,
} from "../services/appointmentService.js";
import { publishMessage, type EmailData } from "../services/emailService.js";
import { formatEmail } from "../utils/formatters.js";
import ApiError from "../utils/ApiError.js";
import type { UserRole } from "../types/index.js";
import { Result } from "better-result";
import { findByIdOrNotFound } from "../services/userService.js";
import logger from "../utils/logger/index.js";
import {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  SessionError,
  ValidationError,
} from "../errors.js";

async function getUserFromSession(req: Request) {
  return Result.gen(async function* () {
    const userId = yield* Result.ok(req.session.userId).andThen(userId => userId ? Result.ok(userId) : Result.err(new SessionError({ statusCode: 401, message: "Session expired" })));
    const user = yield* Result.await(findByIdOrNotFound(userId));
    return Result.ok(user);
  });
}

type HttpError =
  | SessionError
  | AuthorizationError
  | ValidationError
  | NotFoundError
  | DatabaseError;

const isHttpError = (error: unknown): error is HttpError =>
  SessionError.is(error) ||
  AuthorizationError.is(error) ||
  ValidationError.is(error) ||
  NotFoundError.is(error) ||
  DatabaseError.is(error);

const fromApiError = (error: ApiError): HttpError => {
  switch (error.statusCode) {
    case 400:
      return new ValidationError({
        statusCode: 400,
        message: error.message,
      });
    case 401:
      return new SessionError({
        statusCode: 401,
        message: error.message,
      });
    case 403:
      return new AuthorizationError({
        statusCode: 403,
        message: error.message,
      });
    case 404:
      return new NotFoundError({
        statusCode: 404,
        message: error.message,
      });
    default:
      return new DatabaseError({
        statusCode: error.statusCode,
        message: error.message,
      });
  }
};

const toHttpError = (cause: unknown, fallbackMessage: string): HttpError => {
  if (isHttpError(cause)) return cause;
  if (cause instanceof ApiError) return fromApiError(cause);
  return new DatabaseError({
    statusCode: 500,
    message: cause instanceof Error ? cause.message : fallbackMessage,
  });
};

const publishEmailNotification = async (
  payload: EmailData,
  warningMessage: string,
) => {
  try {
    await publishMessage(payload);
    return { queued: true as const };
  } catch (cause) {
    const errorMessage =
      cause instanceof Error ? cause.message : "Unknown error";
    logger.error(
      `Failed to publish email notification: ${errorMessage}`,
    );
    return { queued: false as const, warning: warningMessage };
  }
};

const assertRoleAllowed = (user: User, roles: UserRole[]) =>
  roles.includes(user.role)
    ? Result.ok()
    : Result.err(
      new AuthorizationError({
        statusCode: 403,
        message: "Forbidden: role not allowed",
      }),
    );

const assertAppointmentAccess = (
  user: User,
  appointment: Appointment,
  options: { allowAdmin?: boolean } = {},
) => {
  if (options.allowAdmin && user.role === "admin") return Result.ok();

  const isClientOwner =
    user.role === "client" && appointment.clientId === user.id;
  const isEmployeeOwner =
    user.role === "employee" && appointment.employeeId === user.id;
  if (isClientOwner || isEmployeeOwner) return Result.ok();

  return Result.err(
    new AuthorizationError({
      statusCode: 403,
      message: "Forbidden: not authorized to access this appointment",
    }),
  );
};

const assertValidEmployeeSelection = async (
  employeeId: string,
  clientId: string,
) => {
  if (employeeId === clientId) {
    return Result.err(
      new ValidationError({
        statusCode: 400,
        message: "Client and employee must be different",
      }),
    );
  }

  const employeeResult = await findByIdOrNotFound(employeeId);
  return employeeResult
    .mapError((error) =>
      NotFoundError.is(error)
        ? new ValidationError({ statusCode: 400, message: "Invalid employee" })
        : error,
    )
    .andThen((employee) =>
      employee.role === "employee"
        ? Result.ok()
        : Result.err(
          new ValidationError({
            statusCode: 400,
            message: "Invalid employee",
          }),
        ),
    );
};

/**
 * @description retrieve all appointments
 * @route /api/appointments
 * @method GET
 */
export const getAllAppointments = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(getUserFromSession(req));
    yield* assertRoleAllowed(user, ["client", "employee"]);
    const appointments = yield* Result.await(getAppointmentsByRole(user));
    return Result.ok(appointments);
  });

  return result.match({
    ok: (appointments) => res.json(appointments),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};

/**
 * @description retrieve all appointments
 * @route /api/appointments/:id
 * @method GET
 */
export const getSingleAppointment = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(getUserFromSession(req));
    yield* assertRoleAllowed(user, ["client", "employee"]);

    const appointment = yield* Result.await(
      getClientAppointmentById(req.params.id),
    );

    if (!appointment) {
      return Result.err(
        new NotFoundError({
          statusCode: 404,
          message: "Appointment not found",
        }),
      );
    }

    yield* assertAppointmentAccess(user, appointment);
    return Result.ok(appointment);
  });

  return result.match({
    ok: (appointment) => res.json(appointment),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};

/**
 * @description book a new appointment
 * @route /api/appointments
 * @method POST
 */
export const bookAppointment = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(getUserFromSession(req));
    yield* assertRoleAllowed(user, ["client"]);
    yield* Result.await(
      assertValidEmployeeSelection(req.body.employee.id, user.id),
    );

    const newAppointment = yield* Result.await(
      createNew({
        start: req.body.start,
        end: req.body.end,
        service: req.body.service,
        employeeId: req.body.employee.id,
        clientId: req.session.userId!,
      }),
    );

    const notification = await publishEmailNotification(
      {
        ...formatEmail({
          ...req.body,
          id: newAppointment.id,
          option: "confirmation",
        }),
        receiver: user.email,
      },
      "Appointment booked, but confirmation email could not be queued. We'll retry.",
    );

    return Result.ok({
      success: true,
      message: "Appointment successfully created",
      notification,
    });
  });

  return result.match({
    ok: (payload) => res.status(200).json(payload),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};

/**
 * @description modify an appointment
 * @route /api/appointments/:id
 * @method PUT
 */
export const modifyAppointment = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(getUserFromSession(req));
    yield* assertRoleAllowed(user, ["client", "employee", "admin"]);

    const appointment = (yield* Result.await(
      Result.tryPromise({
        try: () =>
          Appointment.findByPk(req.params.id, {
            include: [{ model: User, as: "client" }],
          }),
        catch: (cause) => toHttpError(cause, "Failed to fetch appointment"),
      }),
    )) as (Appointment & { client?: User }) | null;

    if (!appointment) {
      return Result.err(
        new NotFoundError({
          statusCode: 404,
          message: "Appointment not found",
        }),
      );
    }

    yield* assertAppointmentAccess(user, appointment, { allowAdmin: true });

    const requestedEmployeeId = req.body.employee?.id;
    if (user.role === "employee") {
      if (
        requestedEmployeeId &&
        requestedEmployeeId !== appointment.employeeId
      ) {
        return Result.err(
          new AuthorizationError({
            statusCode: 403,
            message: "Forbidden: cannot change employee",
          }),
        );
      }
    } else if (requestedEmployeeId) {
      const clientId = appointment.clientId;
      yield* Result.await(
        assertValidEmployeeSelection(requestedEmployeeId, clientId),
      );
    }

    const modifiedAppointment = yield* Result.await(
      update({
        id: req.params.id,
        start: req.body.start,
        end: req.body.end,
        service: req.body.service,
        employeeId: req.body.employee?.id,
        status: req.body.status,
      }),
    );

    const receiverEmail = appointment.client?.email ?? user.email;

    const notification = await publishEmailNotification(
      {
        ...formatEmail({
          ...req.body,
          id: modifiedAppointment.id,
          option: "modification",
        }),
        receiver: receiverEmail,
      },
      "Appointment updated, but modification email could not be queued. We'll retry.",
    );

    return Result.ok({
      success: true,
      message: "Appointment successfully updated",
      notification,
    });
  });

  return result.match({
    ok: (payload) => res.status(200).json(payload),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};

/**
 * @description update an appointment status, admin route
 * @route /api/appointments/status/:id
 * @method PUT
 */
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const result = await Result.tryPromise({
    try: () =>
      Appointment.update(
        { status: req.body.status },
        { where: { id: req.params.id } },
      ),
    catch: (cause) => toHttpError(cause, "Failed to update appointment status"),
  });

  return result.match({
    ok: () =>
      res
        .status(200)
        .json({ success: true, message: "Appointment status updated" }),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};

/**
 * @description delete an Appointment by id
 * @route /api/appointments/:id
 * @method DELETE
 */
export const deleteAppointmentById = async (req: Request, res: Response) => {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(getUserFromSession(req));

    const appointment = (yield* Result.await(
      Result.tryPromise({
        try: () =>
          Appointment.findByPk(req.params.id, {
            include: [
              { model: User, as: "employee" },
              { model: User, as: "client" },
            ],
          }),
        catch: (cause) => toHttpError(cause, "Failed to fetch appointment"),
      }),
    )) as (Appointment & { employee: User; client: User }) | null;

    if (!appointment) {
      return Result.err(
        new NotFoundError({
          statusCode: 404,
          message: "Appointment not found",
        }),
      );
    }

    yield* assertAppointmentAccess(user, appointment, { allowAdmin: true });

    yield* Result.await(
      Result.tryPromise({
        try: () => appointment.destroy(),
        catch: (cause) => toHttpError(cause, "Failed to cancel appointment"),
      }),
    );

    const receiverEmail = appointment.client?.email ?? user.email;

    const notification = await publishEmailNotification(
      {
        ...formatEmail({
          id: appointment.id,
          start: appointment.start.toISOString(),
          end: appointment.end.toISOString(),
          service: appointment.service,
          employee: appointment.employee,
          option: "cancellation",
        }),
        receiver: receiverEmail,
      },
      "Appointment cancelled, but cancellation email could not be queued. We'll retry.",
    );

    return Result.ok({
      success: true,
      message: "Appointment successfully cancelled",
      notification,
    });
  });

  return result.match({
    ok: (payload) => res.status(200).json(payload),
    err: (error) => res.status(error.statusCode).json({ error: error.message }),
  });
};
