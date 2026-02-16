import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { generateRange } from "./lib/dateTime";
import { parseName } from "./lib/names";
import { requireAdmin } from "./lib/auth";

const toPublicUser = (user: Doc<"users"> | null) => {
  if (!user) return null;
  const parsedName = parseName(user.name);
  return {
    id: user.id,
    firstName: user.firstName ?? parsedName.firstName ?? "User",
    lastName: user.lastName ?? parsedName.lastName ?? "",
  };
};

type DbCtx = { db: QueryCtx["db"] };

const loadUsersByIds = async (ctx: DbCtx, ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const users = await Promise.all(
    uniqueIds.map((id) =>
      ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("id", id)).first()
    )
  );
  const userMap = new Map<string, Doc<"users">>();
  users.forEach((user) => {
    if (user) userMap.set(user.id, user);
  });
  return userMap;
};

const hydrateAppointments = async (
  ctx: DbCtx,
  appointments: Doc<"appointments">[],
  options: { includeClient: boolean }
) => {
  const employeeIds = appointments.map((appt) => appt.employeeId);
  const clientIds = options.includeClient
    ? appointments.map((appt) => appt.clientId)
    : [];
  const userMap = await loadUsersByIds(ctx, [...employeeIds, ...clientIds]);

  return appointments.map((appt) => ({
    id: appt.id,
    start: appt.start,
    end: appt.end,
    service: appt.service,
    status: appt.status,
    employee: toPublicUser(userMap.get(appt.employeeId) ?? null),
    ...(options.includeClient
      ? { client: toPublicUser(userMap.get(appt.clientId) ?? null) }
      : {}),
  }));
};

export const getPublicSchedules = query({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("schedules").withIndex("by_open").collect();

    const hydrated = await Promise.all(
      schedules.map(async (schedule) => {
        const appointments = await ctx.db
          .query("appointments")
          .withIndex("by_schedule", (q) => q.eq("scheduleId", schedule.id))
          .collect();

        appointments.sort((a, b) => a.start.localeCompare(b.start));

        return {
          id: schedule.id,
          date: schedule.date,
          open: schedule.open,
          close: schedule.close,
          appointments: await hydrateAppointments(ctx, appointments, {
            includeClient: false,
          }),
        };
      })
    );

    return hydrated;
  },
});

export const getPrivateSchedules = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const schedules = await ctx.db.query("schedules").withIndex("by_open").collect();

    const hydrated = await Promise.all(
      schedules.map(async (schedule) => {
        const appointments = await ctx.db
          .query("appointments")
          .withIndex("by_schedule", (q) => q.eq("scheduleId", schedule.id))
          .collect();

        appointments.sort((a, b) => a.start.localeCompare(b.start));

        return {
          id: schedule.id,
          date: schedule.date,
          open: schedule.open,
          close: schedule.close,
          appointments: await hydrateAppointments(ctx, appointments, {
            includeClient: true,
          }),
        };
      })
    );

    return hydrated;
  },
});

export const createSchedules = mutation({
  args: {
    dates: v.array(v.string()),
    open: v.string(),
    close: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.dates.length !== 2) {
      throw new Error("dates must include start and end values.");
    }

    const range = generateRange(
      [args.dates[0], args.dates[1]],
      args.open,
      args.close
    );

    const saved = await Promise.all(
      range.map(async (entry) => {
        const id = crypto.randomUUID();
        await ctx.db.insert("schedules", {
          id,
          date: entry.date,
          open: entry.open,
          close: entry.close,
        });
        return { id, ...entry, appointments: [] };
      })
    );

    return saved;
  },
});
