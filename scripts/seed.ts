import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { hashPassword } from "better-auth/crypto";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";

dayjs.extend(utc);
dayjs.extend(timezone);

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const TZ = "America/New_York";
const DEFAULT_PASSWORD = "Strongpassword123!";

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

const toDateString = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");
const toIso = (date: string, time: string) =>
  dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", TZ).toISOString();

const seedUsers = [
  { firstName: "Admin", lastName: "User", email: "admin@email.com", role: "admin" },
  { firstName: "First", lastName: "User", email: "user1@email.com", role: "client" },
  { firstName: "Second", lastName: "User", email: "user2@email.com", role: "client" },
  { firstName: "Third", lastName: "User", email: "user3@email.com", role: "client" },
  { firstName: "Andre", lastName: "S", email: "andre@cutaboveshop.com", role: "employee" },
  { firstName: "Obi", lastName: "M", email: "obi@cutaboveshop.com", role: "employee" },
  { firstName: "Salah", lastName: "R", email: "salah@cutabove.com", role: "employee" },
  { firstName: "John", lastName: "Smith", email: "johnsmith@email.com", role: "client" },
  { firstName: "Emily", lastName: "Johnson", email: "emilyj@email.com", role: "client" },
];

const appointmentSeeds = [
  { offset: 0, start: "09:00", end: "09:30", service: "Haircut", employee: "Andre", clientIndex: 0 },
  { offset: 0, start: "10:00", end: "10:45", service: "The Full Package", employee: "Obi", clientIndex: 1 },
  { offset: 1, start: "11:00", end: "11:30", service: "Beard Trim", employee: "Salah", clientIndex: 2 },
  { offset: 2, start: "13:00", end: "13:30", service: "Haircut", employee: "Andre", clientIndex: 3 },
  { offset: 3, start: "14:00", end: "14:30", service: "Straight Razor Shave", employee: "Obi", clientIndex: 4 },
  { offset: 4, start: "15:00", end: "15:30", service: "Cut and Shave Package", employee: "Salah", clientIndex: 0 },
];

const env = {
  ...parseEnvFile(resolve(repoRoot, ".env.local")),
  ...parseEnvFile(resolve(repoRoot, "client/.env.local")),
  ...process.env,
};

const deploymentUrl =
  env.CONVEX_DEPLOYMENT_URL ?? env.CONVEX_URL ?? env.CONVEX_HTTP_URL;

if (!deploymentUrl) {
  console.error(
    "Missing CONVEX_DEPLOYMENT_URL (or CONVEX_URL). Set it in .env.local or client/.env.local."
  );
  process.exit(1);
}

const convex = new ConvexHttpClient(deploymentUrl);

const run = async () => {
  const password = env.SEED_PASSWORD ?? DEFAULT_PASSWORD;
  const userMap = new Map<string, string>();

  for (const user of seedUsers) {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const passwordHash = await hashPassword(password);
    const authUser = await convex.mutation(api.seed.ensureAuthUser, {
      name,
      email: user.email,
      passwordHash,
    });
    const authId = authUser?.id;
    if (!authId) {
      throw new Error(`Failed to create auth user for ${user.email}`);
    }

    await convex.mutation(api.seed.ensureAppUser, {
      authId,
      name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });

    userMap.set(user.email, authId);
  }

  const startDate = dayjs().tz(TZ).add(7, "day");
  const scheduleByDate = new Map<string, string>();

  for (let i = 0; i < 7; i += 1) {
    const date = toDateString(startDate.add(i, "day"));
    const open = toIso(date, "08:00");
    const close = toIso(date, "17:00");
    const schedule = await convex.mutation(api.seed.ensureSchedule, {
      date,
      open,
      close,
    });
    if (schedule?.id) {
      scheduleByDate.set(date, schedule.id);
    }
  }

  const employeeIds = {
    Andre: userMap.get("andre@cutaboveshop.com"),
    Obi: userMap.get("obi@cutaboveshop.com"),
    Salah: userMap.get("salah@cutabove.com"),
  };

  const clientIds = [
    userMap.get("user1@email.com"),
    userMap.get("user2@email.com"),
    userMap.get("user3@email.com"),
    userMap.get("johnsmith@email.com"),
    userMap.get("emilyj@email.com"),
  ];

  let insertedAppointments = 0;

  for (const appt of appointmentSeeds) {
    const date = toDateString(startDate.add(appt.offset, "day"));
    const scheduleId = scheduleByDate.get(date);
    if (!scheduleId) continue;

    const employeeId = employeeIds[appt.employee as keyof typeof employeeIds];
    const clientId = clientIds[appt.clientIndex];
    if (!employeeId || !clientId) continue;

    const startIso = toIso(date, appt.start);
    const endIso = toIso(date, appt.end);
    const id = `appt-${date}-${employeeId}-${appt.start.replace(":", "")}`;

    const result = await convex.mutation(api.seed.ensureAppointment, {
      id,
      scheduleId,
      start: startIso,
      end: endIso,
      service: appt.service,
      status: "scheduled",
      clientId,
      employeeId,
    });
    if (result?.inserted) insertedAppointments += 1;
  }

  console.log("Seed complete:", {
    users: seedUsers.map((user) => ({ email: user.email, role: user.role })),
    schedules: scheduleByDate.size,
    appointments: insertedAppointments,
    startDate: toDateString(startDate),
  });
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
