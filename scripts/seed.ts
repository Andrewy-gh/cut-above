import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { hashPassword } from "better-auth/crypto";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import {
  defaultSeedUsers,
  type SeedUserProfile,
  type SeedUserWithPassword,
  validateSeedProfiles,
  validateSeedUsersWithPasswords,
} from "./seed-users";

dayjs.extend(utc);
dayjs.extend(timezone);

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const TZ = "America/New_York";
const DEFAULT_DEV_PASSWORD = "Strongpassword123!";
const DEFAULT_START_OFFSET_DAYS = 14;
const DEFAULT_TOTAL_DAYS = 120;
const DEFAULT_MIN_APPOINTMENTS_PER_EMPLOYEE_DAY = 2;
const DEFAULT_MAX_APPOINTMENTS_PER_EMPLOYEE_DAY = 4;
const DEFAULT_SEED_USERS_FILE = ".seed-prod.json";
const DEFAULT_SEED_PREFIX = "seed-";

type SeedMode = "dev" | "prod";

const serviceCatalog = [
  { name: "Haircut", durationMinutes: 30, weight: 0.35 },
  { name: "Beard Trim", durationMinutes: 15, weight: 0.2 },
  { name: "Straight Razor Shave", durationMinutes: 15, weight: 0.15 },
  { name: "Cut and Shave Package", durationMinutes: 45, weight: 0.2 },
  { name: "The Full Package", durationMinutes: 60, weight: 0.1 },
];

const parseEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, "utf8");
  return content.split("\n").reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const index = trimmed.indexOf("=");
    if (index === -1) return acc;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
};

const env = {
  ...parseEnvFile(resolve(repoRoot, "client/.env.local")),
  ...parseEnvFile(resolve(repoRoot, ".env.local")),
  ...process.env,
};

const getArgValue = (name: string) => {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
};

const resolveMode = (): SeedMode => {
  const mode = (getArgValue("--mode") ?? env.SEED_MODE ?? "dev").toLowerCase().trim();
  if (mode === "dev" || mode === "prod") return mode;
  throw new Error(`Invalid seed mode "${mode}". Use --mode dev or --mode prod.`);
};

const parseIntEnv = (key: string, fallback: number) => {
  const value = env[key];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be an integer. Received "${value}".`);
  }
  return parsed;
};

const toDateString = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");
const toIso = (date: string, time: string) =>
  dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", TZ).toISOString();

const minuteToTime = (minuteOfDay: number) => {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const hashString = (input: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

const makeRandom = (seed: string) => {
  let state = hashString(seed) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const randomBetween = (rand: () => number, min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

const pickService = (rand: () => number) => {
  const totalWeight = serviceCatalog.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rand() * totalWeight;
  for (const service of serviceCatalog) {
    cursor -= service.weight;
    if (cursor <= 0) return service;
  }
  return serviceCatalog[serviceCatalog.length - 1];
};

const sanitizeIdToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const getDeploymentUrl = (source: Record<string, string | undefined>) =>
  source.CONVEX_DEPLOYMENT_URL ?? source.CONVEX_URL ?? source.CONVEX_HTTP_URL;

const loadProdUsers = (usersFile: string): SeedUserWithPassword[] => {
  const absolutePath = resolve(repoRoot, usersFile);
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Missing ${usersFile}. Copy .seed-prod.example.json to ${usersFile} and fill per-user passwords.`
    );
  }

  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as { users?: Array<SeedUserProfile & { password?: string }> };
  if (!Array.isArray(parsed.users)) {
    throw new Error(`${usersFile} must contain { "users": [...] }`);
  }
  return validateSeedUsersWithPasswords(parsed.users);
};

const getSeedUsers = (mode: SeedMode) => {
  if (mode === "dev") return { profiles: validateSeedProfiles(defaultSeedUsers), sharedPassword: true };

  const usersFile = env.SEED_USERS_FILE ?? DEFAULT_SEED_USERS_FILE;
  return { profiles: loadProdUsers(usersFile), sharedPassword: false };
};

const clientEnv = parseEnvFile(resolve(repoRoot, "client/.env.local"));
const rootEnv = parseEnvFile(resolve(repoRoot, ".env.local"));
const processEnv = process.env as Record<string, string | undefined>;

const clientDeploymentUrl = getDeploymentUrl(clientEnv);
const rootDeploymentUrl = getDeploymentUrl(rootEnv);
const processDeploymentUrl = getDeploymentUrl(processEnv);

let deploymentUrlSource: "process.env" | ".env.local" | "client/.env.local" | "unknown" =
  "unknown";

const deploymentUrl =
  processDeploymentUrl ??
  rootDeploymentUrl ??
  clientDeploymentUrl ??
  env.CONVEX_DEPLOYMENT_URL ??
  env.CONVEX_URL ??
  env.CONVEX_HTTP_URL;

if (deploymentUrl === processDeploymentUrl) deploymentUrlSource = "process.env";
else if (deploymentUrl === rootDeploymentUrl) deploymentUrlSource = ".env.local";
else if (deploymentUrl === clientDeploymentUrl) deploymentUrlSource = "client/.env.local";

if (rootDeploymentUrl && clientDeploymentUrl && rootDeploymentUrl !== clientDeploymentUrl) {
  console.warn(
    [
      "Note: .env.local and client/.env.local have different Convex deployment URLs.",
      `- .env.local: ${rootDeploymentUrl}`,
      `- client/.env.local: ${clientDeploymentUrl}`,
      `Using: ${deploymentUrl} (from ${deploymentUrlSource})`,
    ].join("\n")
  );
}

if (!deploymentUrl) {
  console.error(
    "Missing CONVEX_DEPLOYMENT_URL (or CONVEX_URL). Set it in .env.local (preferred) or client/.env.local."
  );
  process.exit(1);
}

const isCloudDeployment = deploymentUrl.includes(".convex.cloud");
if (isCloudDeployment && env.ALLOW_CLOUD_SEED !== "true") {
  console.error(
    `Refusing to seed a cloud deployment (${deploymentUrl}). Set ALLOW_CLOUD_SEED=true to proceed.`
  );
  process.exit(1);
}

const mode = resolveMode();
const startOffsetDays = parseIntEnv("SEED_START_OFFSET_DAYS", DEFAULT_START_OFFSET_DAYS);
const totalDays = parseIntEnv("SEED_TOTAL_DAYS", DEFAULT_TOTAL_DAYS);
const minAppointmentsPerEmployeeDay = parseIntEnv(
  "SEED_MIN_APPOINTMENTS_PER_EMPLOYEE_DAY",
  DEFAULT_MIN_APPOINTMENTS_PER_EMPLOYEE_DAY
);
const maxAppointmentsPerEmployeeDay = parseIntEnv(
  "SEED_MAX_APPOINTMENTS_PER_EMPLOYEE_DAY",
  DEFAULT_MAX_APPOINTMENTS_PER_EMPLOYEE_DAY
);
const seedIdPrefix = (env.SEED_ID_PREFIX ?? DEFAULT_SEED_PREFIX).trim();

if (!seedIdPrefix) throw new Error("SEED_ID_PREFIX cannot be empty.");
if (minAppointmentsPerEmployeeDay <= 0 || maxAppointmentsPerEmployeeDay <= 0) {
  throw new Error("Appointment counts must be positive integers.");
}
if (maxAppointmentsPerEmployeeDay < minAppointmentsPerEmployeeDay) {
  throw new Error("SEED_MAX_APPOINTMENTS_PER_EMPLOYEE_DAY must be >= SEED_MIN_APPOINTMENTS_PER_EMPLOYEE_DAY.");
}
if (totalDays <= 0) throw new Error("SEED_TOTAL_DAYS must be a positive integer.");
if (startOffsetDays < 0) throw new Error("SEED_START_OFFSET_DAYS cannot be negative.");

const userConfig = getSeedUsers(mode);
const users = userConfig.profiles;
const employees = users.filter((user) => user.role === "employee");
const clients = users.filter((user) => user.role === "client");
const sharedPassword = env.SEED_PASSWORD ?? DEFAULT_DEV_PASSWORD;

console.info(
  `Seeding Convex deployment: ${deploymentUrl} (${isCloudDeployment ? "cloud" : "local"}; from ${deploymentUrlSource})`
);
console.info(
  `Seed mode: ${mode}; users: ${users.length}; employees: ${employees.length}; clients: ${clients.length}; start offset: ${startOffsetDays} days; span: ${totalDays} days`
);

const convex = new ConvexHttpClient(deploymentUrl);

const run = async () => {
  const userMap = new Map<string, string>();
  let userUpserts = 0;
  let scheduleInserts = 0;
  let appointmentInserts = 0;
  let appointmentAttempts = 0;

  for (const user of users) {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const password =
      mode === "prod" ? (user as SeedUserWithPassword).password : sharedPassword;

    const passwordHash = await hashPassword(password);
    const authUser = await convex.mutation(api.seed.ensureAuthUser, {
      name,
      email: user.email,
      passwordHash,
    });
    const authId = authUser?.id;
    if (!authId) throw new Error(`Failed to create auth user for ${user.email}`);

    await convex.mutation(api.seed.ensureAppUser, {
      authId,
      name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    userUpserts += 1;
    userMap.set(user.email, authId);
  }

  const startDate = dayjs().tz(TZ).startOf("day").add(startOffsetDays, "day");
  let businessDaysSeeded = 0;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
    const day = startDate.add(dayOffset, "day");
    const weekday = day.day();
    if (weekday === 0 || weekday === 6) continue;

    businessDaysSeeded += 1;
    const date = toDateString(day);
    const scheduleId = `${seedIdPrefix}schedules-${date}`;
    const schedule = await convex.mutation(api.seed.ensureSchedule, {
      id: scheduleId,
      date,
      open: toIso(date, "08:00"),
      close: toIso(date, "17:00"),
    });
    if (schedule?.inserted) scheduleInserts += 1;

    for (const employee of employees) {
      const employeeId = userMap.get(employee.email);
      if (!employeeId) continue;

      const rand = makeRandom(`${date}:${employee.email}`);
      const targetCount = randomBetween(
        rand,
        minAppointmentsPerEmployeeDay,
        maxAppointmentsPerEmployeeDay
      );

      let minuteCursor = 9 * 60 + randomBetween(rand, 0, 60);

      for (let slotIndex = 0; slotIndex < targetCount; slotIndex += 1) {
        const service = pickService(rand);
        const endMinute = minuteCursor + service.durationMinutes;
        if (endMinute > 17 * 60) break;

        const client = clients[Math.floor(rand() * clients.length)];
        const clientId = userMap.get(client.email);
        if (!clientId) continue;

        const startTime = minuteToTime(minuteCursor);
        const endTime = minuteToTime(endMinute);
        const appointmentId = `${seedIdPrefix}appt-${date}-${sanitizeIdToken(employee.email)}-${slotIndex + 1}`;

        appointmentAttempts += 1;
        const result = await convex.mutation(api.seed.ensureAppointment, {
          id: appointmentId,
          scheduleId: schedule.id,
          start: toIso(date, startTime),
          end: toIso(date, endTime),
          service: service.name,
          status: "scheduled",
          clientId,
          employeeId,
        });
        if (result?.inserted) appointmentInserts += 1;

        const nextGap = [15, 30, 45][Math.floor(rand() * 3)];
        minuteCursor = endMinute + nextGap;
      }
    }
  }

  console.log("Seed complete:", {
    mode,
    usersUpserted: userUpserts,
    businessDaysSeeded,
    schedulesInserted: scheduleInserts,
    appointmentsInserted: appointmentInserts,
    appointmentAttempts,
    startDate: toDateString(startDate),
    firstFiveUsers: users.slice(0, 5).map((user) => ({ email: user.email, role: user.role })),
  });
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
