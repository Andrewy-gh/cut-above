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
import { TaggedError } from "better-result";
import { DatabaseError, ValidationError } from "../errors.js";
import logger from "./logger/index.js";

type InvalidParam = {
  name: string;
  reason?: string;
};

type ErrorDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  code?: string;
  invalidParams?: InvalidParam[];
};

type ErrorWithStatus = {
  statusCode: number;
  message: string;
  cause?: unknown;
};

type ErrorDetailsOptions = {
  status?: number;
  detail?: string;
  code?: string;
  invalidParams?: InvalidParam[];
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
    (hasStatusCode(error)
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

const sequelizeDetail = (error: SequelizeValidationError) => {
  const messages = error.errors.map((issue) => issue.message).filter(Boolean);
  return messages.length ? messages.join(", ") : error.message;
};

const sequelizeInvalidParams = (
  error: SequelizeValidationError,
): InvalidParam[] =>
  error.errors.map((issue) => ({
    name: issue.path ? String(issue.path) : "unknown",
    reason: issue.message,
  }));

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
  if (error instanceof SequelizeValidationError) return sequelizeDetail(error);
  if (error instanceof Error) return error.message;
  return STATUS_TITLES[status] ?? "Error";
};

const resolveInvalidParams = (
  error: unknown,
  status: number,
  req: Request,
  overrideInvalidParams?: InvalidParam[],
): InvalidParam[] | undefined => {
  if (status >= 500) return undefined;
  if (!shouldExposeDetail(error, status, req)) return undefined;
  if (overrideInvalidParams && overrideInvalidParams.length > 0) {
    return overrideInvalidParams;
  }
  if (error instanceof SequelizeValidationError) {
    return sequelizeInvalidParams(error);
  }
  return undefined;
};

const resolveCode = (error: unknown, overrideCode?: string): string | undefined => {
  if (overrideCode) return overrideCode;
  if (TaggedError.is(error)) return error._tag;
  if (error instanceof SequelizeValidationError) {
    return "SequelizeValidationError";
  }
  if (error instanceof Error) return error.name;
  return undefined;
};

const resolveType = (status: number, code?: string) =>
  code ? `error:${code}` : `status:${status}`;

export const buildErrorDetails = (
  error: unknown,
  req: Request,
  options?: ErrorDetailsOptions,
): ErrorDetails => {
  const status = resolveStatus(error, options?.status);
  const title = STATUS_TITLES[status] ?? "Error";
  const code = resolveCode(error, options?.code);
  const type = resolveType(status, code);
  const detail = resolveDetail(error, status, req, options?.detail);
  const invalidParams = resolveInvalidParams(
    error,
    status,
    req,
    options?.invalidParams,
  );

  return {
    type,
    title,
    status,
    ...(code ? { code } : {}),
    ...(detail ? { detail } : {}),
    ...(invalidParams ? { invalidParams } : {}),
  };
};

export const errorResponse = (
  res: Response,
  req: Request,
  error: unknown,
  options?: ErrorDetailsOptions,
) => {
  const payload = buildErrorDetails(error, req, options);
  if (payload.status >= 500) {
    logger.error("Server error response", {
      status: payload.status,
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }
  return res.status(payload.status).type("application/problem+json").json(payload);
};
