import type { ApiError, InvalidParam, ProblemDetails } from "@/types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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
