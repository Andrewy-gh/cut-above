import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { DatabaseError, ValidationError } from "../errors.js";
import { buildErrorDetails } from "./errorDetails.js";

const buildReq = (session?: { userId?: string }) =>
  ({ session } as Request);

describe("buildErrorDetails", () => {
  it("includes code, type, and invalid params for validation errors", () => {
    const error = new ValidationError({
      statusCode: 400,
      message: "Invalid input",
    });
    const details = buildErrorDetails(error, buildReq(), {
      detail: "Invalid input",
      invalidParams: [{ name: "email", reason: "Required" }],
    });

    expect(details.status).toBe(400);
    expect(details.title).toBe("Bad Request");
    expect(details.code).toBe("ValidationError");
    expect(details.type).toBe("error:ValidationError");
    expect(details.invalidParams).toEqual([{ name: "email", reason: "Required" }]);
  });

  it("hides detail for server errors", () => {
    const error = new DatabaseError({ statusCode: 500, message: "Boom" });
    const details = buildErrorDetails(error, buildReq({ userId: "user-1" }));

    expect(details.status).toBe(500);
    expect(details.detail).toBeUndefined();
    expect(details.code).toBe("DatabaseError");
    expect(details.type).toBe("error:DatabaseError");
  });
});
