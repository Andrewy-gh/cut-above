import { paginationOptsValidator } from "convex/server";
import type { PaginationOptions } from "convex/server";
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
type ScheduleDoc = Doc<"schedules">;
type ScheduleListView = "upcoming" | "past";
type AppointmentStatusCounts = {
  scheduled: number;
  "checked-in": number;
  completed: number;
};

const scheduleListViewValidator = v.union(
  v.literal("upcoming"),
  v.literal("past")
);
const createEmptyAppointmentStatusCounts = (): AppointmentStatusCounts => ({
  scheduled: 0,
  "checked-in": 0,
  completed: 0,
});

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

const loadScheduleAppointments = async (
  ctx: DbCtx,
  scheduleId: string,
  options: { includeCancelled: boolean }
) => {
  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_schedule", (q) => q.eq("scheduleId", scheduleId))
    .collect();

  const visibleAppointments = options.includeCancelled
    ? appointments
    : appointments.filter((appointment) => appointment.status !== "cancelled");

  visibleAppointments.sort((a, b) => a.start.localeCompare(b.start));
  return visibleAppointments;
};

const hydrateSchedule = async (
  ctx: DbCtx,
  schedule: ScheduleDoc,
  options: { includeClient: boolean; includeCancelled: boolean }
) => {
  const appointments = await loadScheduleAppointments(ctx, schedule.id, {
    includeCancelled: options.includeCancelled,
  });

  return {
    id: schedule.id,
    date: schedule.date,
    open: schedule.open,
    close: schedule.close,
    appointments: await hydrateAppointments(ctx, appointments, {
      includeClient: options.includeClient,
    }),
  };
};

const hydrateSchedules = async (
  ctx: DbCtx,
  schedules: ScheduleDoc[],
  options: { includeClient: boolean; includeCancelled: boolean }
) =>
  Promise.all(
    schedules.map((schedule) => hydrateSchedule(ctx, schedule, options))
  );

const getScheduleByDate = async (ctx: DbCtx, date: string) =>
  ctx.db
    .query("schedules")
    .withIndex("by_date", (q) => q.eq("date", date))
    .first();

const getScheduleById = async (ctx: DbCtx, id: string) =>
  ctx.db
    .query("schedules")
    .withIndex("by_schedule_id", (q) => q.eq("id", id))
    .first();

const summarizeScheduleAppointments = async (ctx: DbCtx, scheduleId: string) => {
  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_schedule", (q) => q.eq("scheduleId", scheduleId))
    .collect();

  const statusCounts = appointments.reduce<AppointmentStatusCounts>(
    (counts, appointment) => {
      if (appointment.status === "scheduled") counts.scheduled += 1;
      if (appointment.status === "checked-in") counts["checked-in"] += 1;
      if (appointment.status === "completed") counts.completed += 1;
      return counts;
    },
    createEmptyAppointmentStatusCounts()
  );

  return {
    appointmentCount: appointments.length,
    appointmentStatusCounts: statusCounts,
  };
};

const buildScheduleListItems = async (ctx: DbCtx, schedules: ScheduleDoc[]) =>
  Promise.all(
    schedules.map(async (schedule) => ({
      id: schedule.id,
      date: schedule.date,
      open: schedule.open,
      close: schedule.close,
      ...(await summarizeScheduleAppointments(ctx, schedule.id)),
    }))
  );

const paginatePrivateSchedules = async (
  ctx: DbCtx,
  args: {
    paginationOpts: PaginationOptions;
    search?: string;
    view: ScheduleListView;
  }
) => {
  const nowIso = new Date().toISOString();
  const search = args.search?.trim().toLowerCase();
  const order = args.view === "past" ? "desc" : "asc";

  if (search) {
    const page = await ctx.db
      .query("schedules")
      .withIndex("by_date", (q) =>
        q.gte("date", search).lte("date", `${search}\uffff`)
      )
      .order(order)
      .filter((q) =>
        args.view === "upcoming"
          ? q.gte(q.field("open"), nowIso)
          : q.lt(q.field("open"), nowIso)
      )
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: await buildScheduleListItems(ctx, page.page),
    };
  }

  const page = await ctx.db
    .query("schedules")
    .withIndex("by_open", (q) =>
      args.view === "upcoming" ? q.gte("open", nowIso) : q.lt("open", nowIso)
    )
    .order(order)
    .paginate(args.paginationOpts);

  return {
    ...page,
    page: await buildScheduleListItems(ctx, page.page),
  };
};

export const getPublicSchedules = query({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("schedules").withIndex("by_open").collect();
    return hydrateSchedules(ctx, schedules, {
      includeClient: false,
      includeCancelled: false,
    });
  },
});

export const getPublicScheduleByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const schedule = await getScheduleByDate(ctx, args.date);
    if (!schedule) {
      return null;
    }

    return hydrateSchedule(ctx, schedule, {
      includeClient: false,
      includeCancelled: false,
    });
  },
});

export const getPrivateSchedules = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const schedules = await ctx.db.query("schedules").withIndex("by_open").collect();
    return hydrateSchedules(ctx, schedules, {
      includeClient: true,
      includeCancelled: true,
    });
  },
});

export const getPrivateScheduleById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const schedule = await getScheduleById(ctx, args.id);
    if (!schedule) {
      return null;
    }

    return hydrateSchedule(ctx, schedule, {
      includeClient: true,
      includeCancelled: true,
    });
  },
});

export const listPrivateSchedules = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    view: scheduleListViewValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return paginatePrivateSchedules(ctx, args);
  },
});

export const getPrivateScheduleStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const nowIso = new Date().toISOString();
    const [schedules, appointments] = await Promise.all([
      ctx.db.query("schedules").withIndex("by_open").collect(),
      ctx.db.query("appointments").collect(),
    ]);

    const upcomingSchedules = schedules.filter(
      (schedule) => schedule.open >= nowIso
    ).length;

    return {
      totalSchedules: schedules.length,
      totalAppointments: appointments.length,
      upcomingSchedules,
      pastSchedules: schedules.length - upcomingSchedules,
    };
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
