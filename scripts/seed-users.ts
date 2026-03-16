export const seedRoles = ["admin", "employee", "client"] as const;
export const DEFAULT_DEV_SEED_USERS_FILE = ".seed-prod.example.json";
export const DEFAULT_PROD_SEED_USERS_FILE = ".seed-prod.json";

export type SeedRole = (typeof seedRoles)[number];

export interface SeedUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: SeedRole;
}

export interface SeedUserWithPassword extends SeedUserProfile {
  password: string;
}

const normalizedRoles = new Set<string>(seedRoles);

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const normalizeName = (value: string) => value.trim();

export const validateSeedProfiles = (users: SeedUserProfile[]) => {
  const seenEmails = new Set<string>();

  const normalized = users.map((raw, index) => {
    const firstName = normalizeName(raw.firstName);
    const lastName = normalizeName(raw.lastName);
    const email = normalizeEmail(raw.email);
    const role = String(raw.role).trim().toLowerCase() as SeedRole;

    if (!firstName) throw new Error(`users[${index}].firstName is required`);
    if (!lastName) throw new Error(`users[${index}].lastName is required`);
    if (!email) throw new Error(`users[${index}].email is required`);
    if (!normalizedRoles.has(role)) {
      throw new Error(`users[${index}].role must be one of ${seedRoles.join(", ")}`);
    }
    if (seenEmails.has(email)) {
      throw new Error(`Duplicate seed user email: ${email}`);
    }
    seenEmails.add(email);

    return { firstName, lastName, email, role };
  });

  const employees = normalized.filter((user) => user.role === "employee");
  const clients = normalized.filter((user) => user.role === "client");
  if (employees.length === 0) throw new Error("Seed users must include at least one employee.");
  if (clients.length === 0) throw new Error("Seed users must include at least one client.");

  return normalized;
};

export const validateSeedUsersWithPasswords = (
  users: Array<SeedUserProfile & { password?: string }>
) => {
  const normalizedProfiles = validateSeedProfiles(users);
  return normalizedProfiles.map((profile, index) => {
    const password = users[index]?.password?.trim() ?? "";
    if (!password) {
      throw new Error(`users[${index}].password is required for production seed mode`);
    }
    return { ...profile, password };
  });
};

export const parseSeedUsersFile = (
  raw: string,
  filePath: string
): Array<SeedUserProfile & { password?: string }> => {
  const parsed = JSON.parse(raw) as {
    users?: Array<SeedUserProfile & { password?: string }>;
  };

  if (!Array.isArray(parsed.users)) {
    throw new Error(`${filePath} must contain { "users": [...] }`);
  }

  return parsed.users;
};
