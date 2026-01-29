import type { Request, Response } from "express";
import {
  AccessDeniedError,
  ConnectionAcquireTimeoutError,
  ConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  ExclusionConstraintError,
  ForeignKeyConstraintError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
  TimeoutError,
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
} from "sequelize";
import { DatabaseError, ValidationError } from "../errors.js";
import ApiError from "./ApiError.js";

type ProblemDetails = {
  title: string;
  status: number;
  detail?: string;
};

type ErrorWithStatus = {
  statusCode: number;
  message: string;
  cause?: unknown;
};

const STATUS_TITLES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Entity",
  502: "Bad Gateway",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

const isAuthenticated = (req: Request) => Boolean(req.session?.userId);

const hasStatusCode = (error: unknown): error is ErrorWithStatus =>
  typeof error === "object" &&
  error !== null &&
  "statusCode" in error &&
  typeof (error as ErrorWithStatus).statusCode === "number";

const inferDbStatus = (cause: unknown): number | undefined => {
  if (!cause) return undefined;

  if (
    cause instanceof ConnectionError ||
    cause instanceof ConnectionRefusedError ||
    cause instanceof ConnectionTimedOutError ||
    cause instanceof ConnectionAcquireTimeoutError ||
    cause instanceof HostNotFoundError ||
    cause instanceof HostNotReachableError ||
    cause instanceof InvalidConnectionError ||
    cause instanceof AccessDeniedError ||
    cause instanceof TimeoutError
  ) {
    return 503;
  }

  if (
    cause instanceof UniqueConstraintError ||
    cause instanceof ExclusionConstraintError
  ) {
    return 409;
  }

  if (
    cause instanceof ForeignKeyConstraintError ||
    cause instanceof SequelizeValidationError
  ) {
    return 400;
  }

  return undefined;
};

const resolveStatus = (error: unknown, overrideStatus?: number): number => {
  const baseStatus =
    overrideStatus ??
    (error instanceof ApiError
      ? error.statusCode
      : hasStatusCode(error)
        ? error.statusCode
        : error instanceof SequelizeValidationError
          ? 400
          : 500);

  if (DatabaseError.is(error) && baseStatus >= 500) {
    const inferred = inferDbStatus(error.cause);
    if (inferred) return inferred;
  }

  return baseStatus;
};

const shouldExposeDetail = (
  error: unknown,
  status: number,
  req: Request,
): boolean => {
  if (status >= 500) return false;
  if (ValidationError.is(error)) return true;
  if (error instanceof SequelizeValidationError) return true;
  return isAuthenticated(req);
};

const resolveDetail = (
  error: unknown,
  status: number,
  req: Request,
  overrideDetail?: string,
): string | undefined => {
  if (status >= 500) return undefined;
  if (status === 409 && !isAuthenticated(req)) {
    return STATUS_TITLES[status] ?? "Error";
  }
  if (!shouldExposeDetail(error, status, req)) {
    return STATUS_TITLES[status] ?? "Error";
  }

  if (overrideDetail) return overrideDetail;
  if (error instanceof Error) return error.message;
  return STATUS_TITLES[status] ?? "Error";
};

const buildProblemDetails = (
  error: unknown,
  req: Request,
  options?: { status?: number; detail?: string },
): ProblemDetails => {
  const status = resolveStatus(error, options?.status);
  const title = STATUS_TITLES[status] ?? "Error";
  const detail = resolveDetail(error, status, req, options?.detail);
  return detail ? { title, status, detail } : { title, status };
};

export const sendProblem = (
  res: Response,
  req: Request,
  error: unknown,
  options?: { status?: number; detail?: string },
) => {
  const payload = buildProblemDetails(error, req, options);
  return res.status(payload.status).type("application/problem+json").json(payload);
};
