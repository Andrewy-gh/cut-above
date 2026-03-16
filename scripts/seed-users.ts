export const seedRoles = ["admin", "employee", "client"] as const;

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

export const defaultSeedUsers: SeedUserProfile[] = [
  { firstName: "Avery", lastName: "Cole", email: "avery.cole@cutabove.test", role: "admin" },
  { firstName: "Andre", lastName: "Silva", email: "andre.silva@cutabove.test", role: "employee" },
  { firstName: "Obi", lastName: "Mensah", email: "obi.mensah@cutabove.test", role: "employee" },
  { firstName: "Salah", lastName: "Rahman", email: "salah.rahman@cutabove.test", role: "employee" },
  { firstName: "Mia", lastName: "Chen", email: "mia.chen@cutabove.test", role: "employee" },
  { firstName: "John", lastName: "Smith", email: "john.smith@cutabove.test", role: "client" },
  { firstName: "Emily", lastName: "Johnson", email: "emily.johnson@cutabove.test", role: "client" },
  { firstName: "Michael", lastName: "Brown", email: "michael.brown@cutabove.test", role: "client" },
  { firstName: "Sophia", lastName: "Davis", email: "sophia.davis@cutabove.test", role: "client" },
  { firstName: "Daniel", lastName: "Wilson", email: "daniel.wilson@cutabove.test", role: "client" },
  { firstName: "Olivia", lastName: "Garcia", email: "olivia.garcia@cutabove.test", role: "client" },
  { firstName: "James", lastName: "Martinez", email: "james.martinez@cutabove.test", role: "client" },
  { firstName: "Ava", lastName: "Anderson", email: "ava.anderson@cutabove.test", role: "client" },
  { firstName: "Benjamin", lastName: "Thomas", email: "benjamin.thomas@cutabove.test", role: "client" },
  { firstName: "Isabella", lastName: "Moore", email: "isabella.moore@cutabove.test", role: "client" },
  { firstName: "Noah", lastName: "Taylor", email: "noah.taylor@cutabove.test", role: "client" },
  { firstName: "Charlotte", lastName: "Jackson", email: "charlotte.jackson@cutabove.test", role: "client" },
  { firstName: "Lucas", lastName: "Martin", email: "lucas.martin@cutabove.test", role: "client" },
  { firstName: "Amelia", lastName: "Lee", email: "amelia.lee@cutabove.test", role: "client" },
];

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
