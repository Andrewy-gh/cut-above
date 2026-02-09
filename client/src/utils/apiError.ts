import type { ApiError, InvalidParam, ProblemDetails } from "@/types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const looksLikeConvexClientErrorMessage = (message: string) =>
  message.includes("[CONVEX ") || message.includes("ConvexError");

const extractConvexErrorCause = (message: string): string | undefined => {
  // Example:
  // Error: [CONVEX M(appointments:createAppointment)] [Request ID: ...] Server Error Uncaught ConvexError: Time slot conflicts...
  const convexIdx = message.lastIndexOf("ConvexError:");
  if (convexIdx !== -1) {
    const after = message.slice(convexIdx + "ConvexError:".length).trim();
    return after || undefined;
  }

  // Some errors may omit the class name but still include the Convex wrapper.
  if (message.includes("[CONVEX ")) {
    return undefined;
  }

  return undefined;
};

const toUserFacingConvexMessage = (cause: string): string | undefined => {
  const normalized = cause.trim();
  if (!normalized) return undefined;

  // Auth / authorization
  if (normalized.toLowerCase() === "not authenticated") {
    return "Please sign in to continue.";
  }
  if (normalized.toLowerCase().startsWith("forbidden")) {
    return "You don't have permission to do that.";
  }

  // Booking / scheduling
  if (normalized.toLowerCase().includes("time slot conflicts")) {
    return "That time is no longer available. Please pick another slot.";
  }
  if (normalized.toLowerCase().includes("no schedule found")) {
    return "No schedule is available for that date. Please try another day.";
  }
  if (normalized.toLowerCase().includes("appointment not found")) {
    return "That appointment could not be found.";
  }
  if (normalized.toLowerCase().includes("invalid employee")) {
    return "Please select a valid barber.";
  }

  // Contact / email
  if (normalized.toLowerCase().includes("must be defined to send messages")) {
    return "Unable to send your message right now. Please try again later.";
  }

  return undefined;
};

export const isProblemDetails = (value: unknown): value is ProblemDetails => {
  if (!isObject(value)) return false;
  return (
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    typeof value.status === "number"
  );
};

export const getProblemDetails = (err: unknown): ProblemDetails | undefined => {
  if (isProblemDetails(err)) return err;
  if (!isObject(err)) return undefined;
  if ("data" in err && isProblemDetails(err.data)) return err.data;
  return undefined;
};

export const getInvalidParams = (err: unknown): InvalidParam[] | undefined => {
  const details = getProblemDetails(err);
  return details?.invalidParams;
};

export const isUnauthorized = (err: ApiError | unknown): boolean => {
  const details = getProblemDetails(err);
  if (details?.status === 401) return true;
  if (isObject(err) && typeof err.status === "number") {
    return err.status === 401;
  }
  return false;
};

export const getErrorMessage = (
  err: ApiError | unknown,
  fallback = "Something went wrong",
): string => {
  if (typeof err === "string" && err.trim()) return err;

  const details = getProblemDetails(err);
  if (details?.detail) return details.detail;
  if (details?.title) return details.title;

  if (isObject(err)) {
    if (typeof err.message === "string" && err.message.trim()) {
      // Convex client errors often include a large wrapper message with request IDs and
      // internal function names. Never show that raw string to end users.
      if (looksLikeConvexClientErrorMessage(err.message)) {
        const cause = extractConvexErrorCause(err.message);
        const userFacing = cause ? toUserFacingConvexMessage(cause) : undefined;
        return userFacing ?? fallback;
      }
      return err.message;
    }
    if (typeof err.error === "string" && err.error.trim()) {
      return err.error;
    }
    if ("data" in err) {
      const data = err.data;
      if (typeof data === "string" && data.trim()) return data;
      if (isObject(data)) {
        if (typeof data.detail === "string" && data.detail.trim()) {
          return data.detail;
        }
        if (typeof data.message === "string" && data.message.trim()) {
          return data.message;
        }
        if (typeof data.error === "string" && data.error.trim()) {
          return data.error;
        }
      }
    }
  }

  return fallback;
};

// User-facing error copy.
// Never returns raw `Error.message` (except for known-safe shapes like problem+json).
export const getPublicErrorMessage = (
  err: ApiError | unknown,
  fallback = "Please try again.",
): string => {
  const details = getProblemDetails(err);
  if (details?.detail) return details.detail;
  if (details?.title) return details.title;

  if (typeof err === "string") return fallback;

  if (isObject(err) && typeof err.message === "string") {
    if (looksLikeConvexClientErrorMessage(err.message)) {
      const cause = extractConvexErrorCause(err.message);
      const userFacing = cause ? toUserFacingConvexMessage(cause) : undefined;
      return userFacing ?? fallback;
    }
  }

  // Unknown error shape: do not leak internals.
  return fallback;
};
