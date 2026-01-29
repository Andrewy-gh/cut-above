import type { Request } from "express";
import { Result } from "better-result";
import type { Appointment, User } from "../models/index.js";
import type { UserRole } from "../types/index.js";
import { findByIdOrNotFound } from "../services/userService.js";
import {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  SessionError,
  ValidationError,
} from "../errors.js";

export type HttpError =
  | SessionError
  | AuthorizationError
  | ValidationError
  | NotFoundError
  | DatabaseError;

export type AppointmentWithUsers = Appointment & {
  client?: User;
  employee?: User;
};

export const isHttpError = (error: unknown): error is HttpError =>
  SessionError.is(error) ||
  AuthorizationError.is(error) ||
  ValidationError.is(error) ||
  NotFoundError.is(error) ||
  DatabaseError.is(error);

export const toHttpError = (cause: unknown, fallbackMessage: string): HttpError => {
  if (isHttpError(cause)) return cause;
  return new DatabaseError({
    statusCode: 500,
    message: cause instanceof Error ? cause.message : fallbackMessage,
    cause,
  });
};

export const getUserFromSession = async (req: Request) =>
  Result.gen(async function* () {
    const userId = yield* Result.ok(req.session.userId).andThen((userId) =>
      userId
        ? Result.ok(userId)
        : Result.err(
            new SessionError({ statusCode: 401, message: "Session expired" }),
          ),
    );
    const user = yield* Result.await(findByIdOrNotFound(userId));
    return Result.ok(user);
  });

export const assertRoleAllowed = (user: User, roles: UserRole[]) =>
  roles.includes(user.role)
    ? Result.ok()
    : Result.err(
        new AuthorizationError({
          statusCode: 403,
          message: "Forbidden: role not allowed",
        }),
      );

export const assertAppointmentAccess = (
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

export const assertValidEmployeeSelection = async (
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
