import { TaggedError } from "better-result";

export class AppError extends TaggedError("AppError")<{
  statusCode: number;
  message: string;
  cause?: unknown;
}>() {}

export class SessionError extends TaggedError("SessionError")<{
  statusCode: number;
  message: string;
}>() {}

export class NotFoundError extends TaggedError("NotFoundError")<{
  statusCode: number;
  message: string;
}>() {}

export class DatabaseError extends TaggedError("DatabaseError")<{
  statusCode: number;
  message: string;
  cause?: unknown;
}>() {}

export class AuthorizationError extends TaggedError("AuthorizationError")<{
  statusCode: number;
  message: string;
}>() {}

export class ValidationError extends TaggedError("ValidationError")<{
  statusCode: number;
  message: string;
}>() {}
