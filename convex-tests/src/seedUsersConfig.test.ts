import { describe, expect, it } from "vitest";

import seedUsersFile from "../../.seed-prod.example.json";
import {
  validateSeedProfiles,
  validateSeedUsersWithPasswords,
} from "../../scripts/seed-users";

describe("tracked seed user config", () => {
  it("provides a valid shared-password local seed user set", () => {
    const users = validateSeedProfiles(seedUsersFile.users);

    expect(users.some((user) => user.role === "admin")).toBe(true);
    expect(users.some((user) => user.role === "employee")).toBe(true);
    expect(users.some((user) => user.role === "client")).toBe(true);
  });

  it("remains valid for prod-like per-user password seed mode", () => {
    const users = validateSeedUsersWithPasswords(seedUsersFile.users);

    expect(users.every((user) => user.password.length > 0)).toBe(true);
  });
});
